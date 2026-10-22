'use client';

import React, { useState } from 'react';
import { Check, Undo2 } from 'lucide-react';
import Button from '@/app/components/Button';
import {
  applyProposal,
  applySelectedChanges,
  definitionChangeId,
  diffList,
  formChangeId,
  getChangeIds,
  getProposalChanges,
  hasChanges,
  listChangeId,
  type ChangeKind,
  type DefinitionChange,
  type DefinitionField,
  type FormChange,
  type ProposalChanges,
} from '@/utils/ai/proposalChanges';
import type { ProposedWord, WordDraft } from '@/utils/ai/wordProposal';
import style from './ProposalSummary.module.css';

type Props = {
  draft: WordDraft;
  word: ProposedWord;
  // This is the last proposal applied to the form
  applied: boolean;
  // The form is still exactly as the proposal left it, so undoing can't lose later edits
  canUndo: boolean;
  onApply: (result: WordDraft) => void;
  onUndo: () => void;
};

type Selection = {
  isSelected: (id: string) => boolean;
  setSelected: (ids: string[], selected: boolean) => void;
};

const KIND_LABELS: Record<ChangeKind, string> = {
  added: 'Dodano',
  changed: 'Izmijenjeno',
  removed: 'Uklonjeno',
};

const KIND_STYLES: Record<ChangeKind, string> = {
  added: style.added,
  changed: style.changed,
  removed: style.removed,
};

const KIND_SIGNS: Record<ChangeKind, string> = { added: '+', changed: '~', removed: '−' };

const FIELD_LABELS: Record<DefinitionField, string> = {
  type: 'vrsta riječi',
  gender: 'rod',
  definition: 'definicija',
  examples: 'primjeri',
  synonyms: 'sinonimi',
  antonyms: 'antonimi',
  part_of_speech: 'gramatička oznaka',
  pronunciation_ipa: 'izgovor (IPA)',
};

const LIST_FIELDS: DefinitionField[] = ['examples', 'synonyms', 'antonyms'];

// Long sections such as a full verb table start collapsed
const MAX_OPEN_CHANGES = 6;

const Tag = ({ kind }: { kind: ChangeKind }) => (
  <span className={KIND_STYLES[kind]}>{KIND_LABELS[kind]}</span>
);

const Replacement = ({ before, after }: { before: string; after: string }) => (
  <>
    <del className={style.before}>{before || '(prazno)'}</del>
    {' → '}
    <ins className={style.after}>{after || '(prazno)'}</ins>
  </>
);

// Checked when all of the given changes are selected, mixed when only some are
const SelectionCheckbox = ({
  ids,
  selection,
  label,
}: {
  ids: string[];
  selection: Selection;
  label?: string;
}) => {
  const count = ids.filter(selection.isSelected).length;
  return (
    <input
      type="checkbox"
      className={style.checkbox}
      checked={count === ids.length}
      ref={(el) => {
        if (el) el.indeterminate = count > 0 && count < ids.length;
      }}
      onChange={(e) => selection.setSelected(ids, e.target.checked)}
      aria-label={label}
    />
  );
};

const ChangeRow = ({
  ids,
  selection,
  children,
}: {
  ids: string[];
  selection: Selection;
  children: React.ReactNode;
}) => (
  <label className={style.change}>
    <SelectionCheckbox ids={ids} selection={selection} />
    <span>{children}</span>
  </label>
);

const Section = ({
  title,
  kinds,
  ids,
  selection,
  children,
}: {
  title: string;
  kinds: ChangeKind[];
  ids: string[];
  selection: Selection;
  children: React.ReactNode;
}) => {
  if (kinds.length === 0) return null;
  const counts = (['added', 'changed', 'removed'] as const)
    .map((kind) => ({ kind, count: kinds.filter((k) => k === kind).length }))
    .filter(({ count }) => count > 0);

  return (
    <details className={style.section} open={kinds.length <= MAX_OPEN_CHANGES}>
      <summary className={style.sectionSummary}>
        <span className={style.sectionTitle}>{title}</span>
        {counts.map(({ kind, count }) => (
          <span
            key={kind}
            className={KIND_STYLES[kind]}
            aria-label={`${KIND_LABELS[kind]}: ${count}`}
          >
            {KIND_SIGNS[kind]}
            {count}
          </span>
        ))}
      </summary>
      <ul className={style.changes}>
        {ids.length > 1 && (
          <li>
            <label className={style.selectAll}>
              <SelectionCheckbox ids={ids} selection={selection} />
              Odaberi sve
            </label>
          </li>
        )}
        {children}
      </ul>
    </details>
  );
};

const fieldText = (value: unknown) => (value == null ? '' : String(value));

const FieldChange = ({
  change,
  field,
}: {
  change: Extract<DefinitionChange, { kind: 'changed' }>;
  field: DefinitionField;
}) => {
  if (!LIST_FIELDS.includes(field)) {
    return (
      <Replacement
        before={fieldText(change.before[field])}
        after={fieldText(change.after[field])}
      />
    );
  }
  return diffList(
    (change.before[field] as string[]) ?? [],
    (change.after[field] as string[]) ?? []
  ).map((c, i) =>
    c.kind === 'added' ? (
      <ins key={i} className={style.listAdded}>
        {c.value}
      </ins>
    ) : (
      <del key={i} className={style.listRemoved}>
        {c.value}
      </del>
    )
  );
};

const DefinitionItem = ({
  change,
  selection,
}: {
  change: DefinitionChange;
  selection: Selection;
}) => {
  const label = `Definicija ${change.index + 1}`;
  if (change.kind !== 'changed') {
    const definition = change.kind === 'added' ? change.after : change.before;
    return (
      <li>
        <ChangeRow ids={[definitionChangeId(change.index)]} selection={selection}>
          <Tag kind={change.kind} /> <strong>{label}:</strong> {definition.definition || '(prazno)'}
        </ChangeRow>
      </li>
    );
  }

  const ids = change.fields.map((field) => definitionChangeId(change.index, field));
  return (
    <li>
      <ChangeRow ids={ids} selection={selection}>
        <Tag kind="changed" /> <strong>{label}</strong>
      </ChangeRow>
      <ul className={style.fieldChanges}>
        {change.fields.map((field, i) => (
          <li key={field}>
            <ChangeRow ids={[ids[i]]} selection={selection}>
              {FIELD_LABELS[field]}: <FieldChange change={change} field={field} />
            </ChangeRow>
          </li>
        ))}
      </ul>
    </li>
  );
};

const FormItem = ({
  change,
  id,
  selection,
}: {
  change: FormChange;
  id: string;
  selection: Selection;
}) => (
  <li>
    <ChangeRow ids={[id]} selection={selection}>
      <Tag kind={change.kind} /> {change.name}, {change.form}:{' '}
      {change.kind === 'changed' ? (
        <Replacement before={change.before ?? ''} after={change.after ?? ''} />
      ) : (
        (change.after ?? change.before)
      )}
    </ChangeRow>
  </li>
);

// The list of changes with a checkbox each; everything starts selected
const ChangeSelection = ({
  changes,
  onApply,
}: {
  changes: ProposalChanges;
  onApply: (selected: ReadonlySet<string>, all: boolean) => void;
}) => {
  const allIds = getChangeIds(changes);
  const [deselected, setDeselected] = useState<ReadonlySet<string>>(new Set());
  const selection: Selection = {
    isSelected: (id) => !deselected.has(id),
    setSelected: (ids, selected) =>
      setDeselected((prev) => {
        const next = new Set(prev);
        for (const id of ids) {
          if (selected) next.delete(id);
          else next.add(id);
        }
        return next;
      }),
  };
  const selectedIds = allIds.filter(selection.isSelected);
  const all = selectedIds.length === allIds.length;

  return (
    <>
      {allIds.length > 1 && (
        <label className={style.selectAll}>
          <SelectionCheckbox ids={allIds} selection={selection} />
          Odabrano {selectedIds.length} od {allIds.length}
        </label>
      )}
      <Section
        title="Porijeklo"
        kinds={changes.origins.map((c) => c.kind)}
        ids={changes.origins.map((_, i) => listChangeId('origins', i))}
        selection={selection}
      >
        {changes.origins.map((c, i) => (
          <li key={i}>
            <ChangeRow ids={[listChangeId('origins', i)]} selection={selection}>
              <Tag kind={c.kind} /> {c.value}
            </ChangeRow>
          </li>
        ))}
      </Section>
      <Section
        title="Alternativni oblici"
        kinds={changes.alternatives.map((c) => c.kind)}
        ids={changes.alternatives.map((_, i) => listChangeId('alternatives', i))}
        selection={selection}
      >
        {changes.alternatives.map((c, i) => (
          <li key={i}>
            <ChangeRow ids={[listChangeId('alternatives', i)]} selection={selection}>
              <Tag kind={c.kind} /> {c.value}
            </ChangeRow>
          </li>
        ))}
      </Section>
      <Section
        title="Definicije"
        kinds={changes.definitions.map((c) => c.kind)}
        ids={allIds.filter((id) => id.startsWith('definitions:'))}
        selection={selection}
      >
        {changes.definitions.map((c) => (
          <DefinitionItem key={c.index} change={c} selection={selection} />
        ))}
      </Section>
      <Section
        title="Oblici"
        kinds={changes.forms.map((c) => c.kind)}
        ids={changes.forms.map((_, i) => formChangeId(i))}
        selection={selection}
      >
        {changes.forms.map((c, i) => (
          <FormItem key={i} change={c} id={formChangeId(i)} selection={selection} />
        ))}
      </Section>
      <Button
        type="button"
        className={style.applyButton}
        disabled={selectedIds.length === 0}
        onClick={() => onApply(new Set(selectedIds), all)}
      >
        <Check size={16} />
        {all ? 'Primijeni' : `Primijeni odabrano (${selectedIds.length})`}
      </Button>
    </>
  );
};

// What a proposal would change in the form, per section, with the changes to apply selectable
const ProposalSummary: React.FC<Props> = ({ draft, word, applied, canUndo, onApply, onUndo }) => {
  const changes = getProposalChanges(draft, word);
  const changed = hasChanges(changes);

  return (
    <div className={style.proposal}>
      {applied && (
        <>
          <p className={style.appliedNote}>
            <Check size={14} />
            Primijenjeno na formu. Sačuvajte riječ da zadržite izmjene.
          </p>
          {canUndo && (
            <button type="button" className={style.undoButton} onClick={onUndo}>
              <Undo2 size={14} />
              Poništi
            </button>
          )}
        </>
      )}
      {changed ? (
        <>
          {applied && <p className={style.remainingNote}>Preostale izmjene iz prijedloga:</p>}
          {/* Changes are recomputed against the current form, so a new set starts fully selected
              instead of keeping choices that may now point at different changes */}
          <ChangeSelection
            key={JSON.stringify(changes)}
            changes={changes}
            onApply={(selected, all) =>
              onApply(
                all ? applyProposal(draft, word) : applySelectedChanges(draft, changes, selected)
              )
            }
          />
        </>
      ) : (
        !applied && <p className={style.noChanges}>Prijedlog ne mijenja trenutnu formu.</p>
      )}
    </div>
  );
};

export default ProposalSummary;
