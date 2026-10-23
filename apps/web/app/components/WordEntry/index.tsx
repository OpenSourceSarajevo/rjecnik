import MeaningCard from './MeaningCard';
import Forms from './Forms';

import style from './WordEntry.module.css';

export type WordDefinition = {
  type: string | null;
  gender: string | null;
  examples: string[] | null;
  definition: string;
  part_of_speech: string | null;
  pronunciation_ipa: string | null;
  pronunciation_audio: string | null;
  synonyms: string[];
  antonyms: string[];
};

export type WordForm = {
  form: string;
  name: string;
  value: string;
  category: string;
};

export type WordDetails = {
  id: number;
  headword: string;
  definitions: WordDefinition[];
  origins: string[] | null;
  alternatives: string[] | null;
  forms: WordForm[];
};

type WordEntryProps = {
  word: Omit<WordDetails, 'id'>;
  // Rendered next to the headword, e.g. the report button
  action?: React.ReactNode;
  // Rendered below the headword
  meta?: React.ReactNode;
};

const Origins = ({ origins }: { origins: string[] | null }) => {
  if (!origins || origins.length === 0) return null;

  return (
    <div className={style.origins}>
      <span className={style.originsLabel}>Porijeklo</span>
      {origins.map((origin: string, index: number) => (
        <span key={index} className={style.origin}>
          {origin}
        </span>
      ))}
    </div>
  );
};

const WordEntry = ({ word, action, meta }: WordEntryProps) => {
  const { headword, alternatives, origins, definitions, forms } = word;

  return (
    <article>
      <header className={style.header}>
        <div className={style.titleRow}>
          <h1 className={style.word}>
            {headword}
            {alternatives && alternatives.length > 0 && (
              <span className={style.alternatives}> / {alternatives.join(' / ')}</span>
            )}
          </h1>
          {action}
        </div>
        {meta}
        <Origins origins={origins} />
      </header>

      <section className={style.section}>
        <h2 className={style.sectionTitle}>Značenja</h2>
        <ol className={style.meanings}>
          {definitions.map((details, index) => (
            <MeaningCard key={index} {...details} />
          ))}
        </ol>
      </section>

      <Forms forms={forms} />
    </article>
  );
};

export default WordEntry;
