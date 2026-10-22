'use client';

import React from 'react';
import { Check, Undo2 } from 'lucide-react';
import Button from '@/app/components/Button';
import {
  diffList,
  getProposalChanges,
  hasChanges,
  type ChangeKind,
  type DefinitionChange,
  type DefinitionField,
  type FormChange,
  type ListChange,
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
  onApply: () => void;
  onUndo: () => void;
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

const Section = ({
  title,
  kinds,
  children,
}: {
  title: string;
  kinds: ChangeKind[];
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
      <ul className={style.changes}>{children}</ul>
    </details>
  );
};

const ListItems = ({ changes }: { changes: ListChange[] }) =>
  changes.map((c, i) => (
    <li key={i} className={style.change}>
      <Tag kind={c.kind} /> {c.value}
    </li>
  ));

const fieldText = (value: unknown) => (value == null ? '' : String(value));

const DefinitionItem = ({ change }: { change: DefinitionChange }) => {
  const label = `Definicija ${change.index + 1}`;
  if (change.kind !== 'changed') {
    const definition = change.kind === 'added' ? change.after : change.before;
    return (
      <li className={style.change}>
        <Tag kind={change.kind} /> <strong>{label}:</strong> {definition.definition || '(prazno)'}
      </li>
    );
  }

  return (
    <li className={style.change}>
      <Tag kind="changed" /> <strong>{label}</strong>
      <ul className={style.fieldChanges}>
        {change.fields.map((field) =>
          LIST_FIELDS.includes(field) ? (
            diffList(
              (change.before[field] as string[]) ?? [],
              (change.after[field] as string[]) ?? []
            ).map((c, i) => (
              <li key={`${field}-${i}`}>
                {FIELD_LABELS[field]}:{' '}
                {c.kind === 'added' ? (
                  <ins className={style.after}>{c.value}</ins>
                ) : (
                  <del className={style.before}>{c.value}</del>
                )}
              </li>
            ))
          ) : (
            <li key={field}>
              {FIELD_LABELS[field]}:{' '}
              <Replacement
                before={fieldText(change.before[field])}
                after={fieldText(change.after[field])}
              />
            </li>
          )
        )}
      </ul>
    </li>
  );
};

const FormItem = ({ change }: { change: FormChange }) => (
  <li className={style.change}>
    <Tag kind={change.kind} /> {change.name}, {change.form}:{' '}
    {change.kind === 'changed' ? (
      <Replacement before={change.before ?? ''} after={change.after ?? ''} />
    ) : (
      (change.after ?? change.before)
    )}
  </li>
);

// What a proposal would change in the form, per section, with the button that applies it
const ProposalSummary: React.FC<Props> = ({ draft, word, applied, canUndo, onApply, onUndo }) => {
  if (applied) {
    return (
      <div className={style.proposal}>
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
      </div>
    );
  }

  const changes = getProposalChanges(draft, word);
  if (!hasChanges(changes)) {
    return (
      <div className={style.proposal}>
        <p className={style.noChanges}>Prijedlog ne mijenja trenutnu formu.</p>
      </div>
    );
  }

  return (
    <div className={style.proposal}>
      <Section title="Porijeklo" kinds={changes.origins.map((c) => c.kind)}>
        <ListItems changes={changes.origins} />
      </Section>
      <Section title="Alternativni oblici" kinds={changes.alternatives.map((c) => c.kind)}>
        <ListItems changes={changes.alternatives} />
      </Section>
      <Section title="Definicije" kinds={changes.definitions.map((c) => c.kind)}>
        {changes.definitions.map((c) => (
          <DefinitionItem key={c.index} change={c} />
        ))}
      </Section>
      <Section title="Oblici" kinds={changes.forms.map((c) => c.kind)}>
        {changes.forms.map((c, i) => (
          <FormItem key={i} change={c} />
        ))}
      </Section>
      <Button type="button" className={style.applyButton} onClick={onApply}>
        <Check size={16} />
        Primijeni
      </Button>
    </div>
  );
};

export default ProposalSummary;
