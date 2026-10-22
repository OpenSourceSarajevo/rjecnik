import type { Definition } from '@/app/api/dictionary/route';
import {
  toWordContext,
  type ProposedDefinition,
  type ProposedWord,
  type WordDraft,
} from './wordProposal';

export type ChangeKind = 'added' | 'changed' | 'removed';

export type ListChange = { kind: 'added' | 'removed'; value: string };

export type DefinitionField = keyof ProposedDefinition;

export type DefinitionChange =
  | { kind: 'added'; index: number; after: ProposedDefinition }
  | { kind: 'removed'; index: number; before: ProposedDefinition }
  | {
      kind: 'changed';
      index: number;
      before: ProposedDefinition;
      after: ProposedDefinition;
      fields: DefinitionField[];
    };

export type FormChange = {
  kind: ChangeKind;
  category: string;
  form: string;
  name: string;
  before?: string;
  after?: string;
};

export type ProposalChanges = {
  origins: ListChange[];
  alternatives: ListChange[];
  definitions: DefinitionChange[];
  forms: FormChange[];
};

// Items added and removed between two lists, ignoring order. Duplicates count separately, so
// ["a", "a"] -> ["a"] removes one "a".
export const diffList = (before: string[], after: string[]): ListChange[] => {
  const remaining = [...before];
  const added: ListChange[] = [];
  for (const value of after) {
    const i = remaining.indexOf(value);
    if (i >= 0) remaining.splice(i, 1);
    else added.push({ kind: 'added', value });
  }
  return [...added, ...remaining.map((value): ListChange => ({ kind: 'removed', value }))];
};

const DEFINITION_FIELDS: DefinitionField[] = [
  'type',
  'gender',
  'definition',
  'examples',
  'synonyms',
  'antonyms',
  'part_of_speech',
  'pronunciation_ipa',
];

const isSameValue = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

// Definitions are compared by position: a split shows up as the first definition changing and the
// others being added, which matches how the editor reads the list
const diffDefinitions = (
  before: ProposedDefinition[],
  after: ProposedDefinition[]
): DefinitionChange[] => {
  const changes: DefinitionChange[] = [];
  for (let index = 0; index < Math.max(before.length, after.length); index++) {
    const b = before[index];
    const a = after[index];
    if (!b) changes.push({ kind: 'added', index, after: a });
    else if (!a) changes.push({ kind: 'removed', index, before: b });
    else {
      const fields = DEFINITION_FIELDS.filter((field) => !isSameValue(b[field], a[field]));
      if (fields.length) changes.push({ kind: 'changed', index, before: b, after: a, fields });
    }
  }
  return changes;
};

// Forms are matched by category, form and name, e.g. padež / jednina / genitiv
const formKey = (f: { category: string; form: string; name: string }) =>
  `${f.category}\u0000${f.form}\u0000${f.name}`;

const diffForms = (before: ProposedWord['forms'], after: ProposedWord['forms']): FormChange[] => {
  const beforeByKey = new Map(before.map((f) => [formKey(f), f]));
  const afterKeys = new Set(after.map(formKey));
  const changes: FormChange[] = [];

  for (const f of after) {
    const previous = beforeByKey.get(formKey(f));
    if (!previous) {
      changes.push({ kind: 'added', ...f, after: f.value });
    } else if (previous.value !== f.value) {
      changes.push({ kind: 'changed', ...f, before: previous.value, after: f.value });
    }
  }
  for (const f of before) {
    if (!afterKeys.has(formKey(f))) changes.push({ kind: 'removed', ...f, before: f.value });
  }
  return changes;
};

// What applying the proposal would change in the editor's current form
export const getProposalChanges = (draft: WordDraft, proposed: ProposedWord): ProposalChanges => {
  const current = toWordContext(draft);
  return {
    origins: diffList(current.origins, proposed.origins),
    alternatives: diffList(current.alternatives, proposed.alternatives),
    definitions: diffDefinitions(current.definitions, proposed.definitions),
    forms: diffForms(current.forms, proposed.forms),
  };
};

export const hasChanges = (changes: ProposalChanges) =>
  Object.values(changes).some((section) => section.length > 0);

// Ids of the changes the editor can accept one by one: each origin, alternative and form, each
// added or removed definition, and each changed field of a definition
export const listChangeId = (section: 'origins' | 'alternatives', index: number) =>
  `${section}:${index}`;
export const definitionChangeId = (index: number, field?: DefinitionField) =>
  field ? `definitions:${index}:${field}` : `definitions:${index}`;
export const formChangeId = (index: number) => `forms:${index}`;

export const getChangeIds = (changes: ProposalChanges): string[] => [
  ...changes.origins.map((_, i) => listChangeId('origins', i)),
  ...changes.alternatives.map((_, i) => listChangeId('alternatives', i)),
  ...changes.definitions.flatMap((c) =>
    c.kind === 'changed'
      ? c.fields.map((field) => definitionChangeId(c.index, field))
      : [definitionChangeId(c.index)]
  ),
  ...changes.forms.map((_, i) => formChangeId(i)),
];

// The form contents after accepting only some of the changes. Accepted additions go to the end of
// their list; everything that was not accepted stays as it is.
export const applySelectedChanges = (
  draft: WordDraft,
  changes: ProposalChanges,
  selected: ReadonlySet<string>
): WordDraft => {
  const applyList = (section: 'origins' | 'alternatives') => {
    const result = [...draft[section]];
    changes[section].forEach((c, i) => {
      if (!selected.has(listChangeId(section, i))) return;
      if (c.kind === 'added') result.push(c.value);
      else result.splice(result.indexOf(c.value), 1);
    });
    return result;
  };

  const definitions: (Definition | null)[] = [...draft.definitions];
  for (const c of changes.definitions) {
    if (c.kind === 'changed') {
      const accepted = c.fields.filter((field) => selected.has(definitionChangeId(c.index, field)));
      if (accepted.length) {
        definitions[c.index] = {
          ...draft.definitions[c.index],
          ...Object.fromEntries(accepted.map((field) => [field, c.after[field]])),
        };
      }
    } else if (selected.has(definitionChangeId(c.index))) {
      // Additions only exist past the end of the current list, removals only when the proposal is
      // shorter, so a definition is never both added and removed
      if (c.kind === 'added') definitions.push({ ...c.after, pronunciation_audio: null });
      else definitions[c.index] = null;
    }
  }

  let forms = [...draft.forms];
  changes.forms.forEach((c, i) => {
    if (!selected.has(formChangeId(i))) return;
    const key = formKey(c);
    const { category, form, name } = c;
    if (c.kind === 'added') forms.push({ category, form, name, value: c.after ?? '' });
    else if (c.kind === 'changed') {
      forms = forms.map((f) => (formKey(f) === key ? { ...f, value: c.after ?? '' } : f));
    } else forms = forms.filter((f) => formKey(f) !== key);
  });

  return {
    headword: draft.headword,
    origins: applyList('origins'),
    alternatives: applyList('alternatives'),
    definitions: definitions.filter((d): d is Definition => d !== null),
    forms,
  };
};

// The form contents after applying a proposal. The headword is not part of the proposal, and
// pronunciation audio, which the assistant never sees, stays with the definition at the same
// position.
export const applyProposal = (draft: WordDraft, proposed: ProposedWord): WordDraft => ({
  headword: draft.headword,
  origins: proposed.origins,
  alternatives: proposed.alternatives,
  definitions: proposed.definitions.map(
    (d, i): Definition => ({
      ...d,
      pronunciation_audio: draft.definitions[i]?.pronunciation_audio ?? null,
    })
  ),
  forms: proposed.forms.map(({ category, form, name, value }) => ({ category, form, name, value })),
});
