import { Word, Definition } from '@/app/api/dictionary/route';
import { useEffect, useState } from 'react';
import { Search, X } from 'lucide-react';

import WordTypeSelect from '@/app/(dashboard)/components/WordTypeSelect';
import GenderSelect from '@/app/(dashboard)/components/GenderSelect';
import style from './AddDefinitionForm.module.css';
import Button from '@/app/components/Button';

export type NewDefinitionDraft = {
  type: string;
  gender: string;
  definition: string;
  examples: string[];
  updateFrequency: boolean;
};

type AddDefinitionFormProps = {
  className?: string;
  selectedWord: Word | null;
  setSelectedWord: React.Dispatch<React.SetStateAction<Word | null>>;
  candidateExamples: string[];
  draft: NewDefinitionDraft;
  setDraft: React.Dispatch<React.SetStateAction<NewDefinitionDraft>>;
};

const AddDefinitionForm: React.FC<AddDefinitionFormProps> = ({
  className,
  selectedWord,
  setSelectedWord,
  candidateExamples,
  draft,
  setDraft,
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Word[]>([]);
  const [definitions, setDefinitions] = useState<Definition[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!query) {
      setResults([]);
      return;
    }
    const timeout = setTimeout(async () => {
      const res = await fetch(
        `/api/dictionary?pageNumber=0&pageSize=5&word=${encodeURIComponent(query)}`
      );
      const data = await res.json();
      setResults(data);
    }, 300);

    return () => clearTimeout(timeout);
  }, [query]);

  useEffect(() => {
    if (!selectedWord) return;
    (async () => {
      const res = await fetch(`/api/dictionary/${selectedWord.headword}`);
      if (res.ok) {
        const data = await res.json();
        setDefinitions((data.definitions as Definition[]) || []);
        setIsLoading(false);
      }
    })();
  }, [selectedWord]);

  const toggleExample = (example: string) => {
    setDraft((prev) => ({
      ...prev,
      examples: prev.examples.includes(example)
        ? prev.examples.filter((ex) => ex !== example)
        : [...prev.examples, example],
    }));
  };

  return (
    <div className={`${style.container} ${className}`}>
      {!selectedWord && (
        <div className={style.searchSection}>
          <label>Pronađi riječ</label>
          <div className={style.searchInputWrap}>
            <Search size={16} className={style.searchIcon} />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className={style.input}
              placeholder="Unesi riječ za pretragu..."
            />
          </div>
          <ul className={style.results}>
            {results.map((w) => (
              <li
                key={w.id}
                onClick={() => {
                  setIsLoading(true);
                  setSelectedWord(w);
                }}
                className={style.resultItem}
              >
                {w.headword}
              </li>
            ))}
          </ul>
        </div>
      )}

      {selectedWord && (
        <div>
          <div className={style.selectedHeader}>
            <h3 className={style.headword}>Riječ: {selectedWord.headword}</h3>
            <Button
              type="button"
              className={style.changeButton}
              onClick={() => {
                setSelectedWord(null);
                setQuery('');
              }}
            >
              <X size={14} />
              Promijeni riječ
            </Button>
          </div>

          {!isLoading && (
            <>
              <h4 className={style.sectionHeading}>Postojeće definicije</h4>
              {definitions.length ? (
                <ul className={style.definitionsList}>
                  {definitions.map((def, idx) => (
                    <li key={idx} className={style.definitionItem}>
                      {def.type && <span className={style.definitionType}>{def.type}</span>}
                      {def.definition || 'Bez definicije'}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className={style.emptyState}>Ova riječ još nema definicija.</p>
              )}

              <h4 className={style.sectionHeading}>Nova definicija</h4>
              <div className={style.fieldRow}>
                <div className={style.fieldGroup}>
                  <label>Vrsta riječi</label>
                  <WordTypeSelect
                    value={draft.type}
                    onChange={(value) => setDraft((prev) => ({ ...prev, type: value || '' }))}
                  />
                </div>
                {(draft.type === 'imenica' || draft.type === 'pridjev') && (
                  <div className={style.fieldGroup}>
                    <label>Rod</label>
                    <GenderSelect
                      value={draft.gender}
                      onChange={(value) => setDraft((prev) => ({ ...prev, gender: value || '' }))}
                    />
                  </div>
                )}
              </div>

              <div className={style.fieldGroup}>
                <label>Definicija</label>
                <textarea
                  value={draft.definition}
                  className={style.textarea}
                  placeholder="Unesi definiciju..."
                  rows={3}
                  onChange={(e) => setDraft((prev) => ({ ...prev, definition: e.target.value }))}
                />
              </div>

              <h4 className={style.sectionHeading}>Primjeri za novu definiciju</h4>
              {candidateExamples.length ? (
                <div className={style.exampleChecklist}>
                  {candidateExamples.map((ex, i) => (
                    <label key={i} className={style.exampleCheckOption}>
                      <input
                        type="checkbox"
                        checked={draft.examples.includes(ex)}
                        onChange={() => toggleExample(ex)}
                      />
                      {ex}
                    </label>
                  ))}
                </div>
              ) : (
                <p className={style.emptyState}>Nema primjera za dodavanje.</p>
              )}

              <label className={style.frequencyOption}>
                <input
                  type="checkbox"
                  checked={draft.updateFrequency}
                  onChange={(e) =>
                    setDraft((prev) => ({ ...prev, updateFrequency: e.target.checked }))
                  }
                />
                Ažuriraj frekvenciju
              </label>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default AddDefinitionForm;
