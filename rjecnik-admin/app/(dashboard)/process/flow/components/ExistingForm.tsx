import { Word, WordForm } from '@/app/api/dictionary/route';
import { useEffect, useState } from 'react';
import { Search, X } from 'lucide-react';

import style from './ExistingForm.module.css';
import Button from '@/app/components/Button';

type ExistingFormProps = {
  className?: string;
  selectedWord: Word | null;
  setSelectedWord: React.Dispatch<React.SetStateAction<Word | null>>;
};

const ExistingForm: React.FC<ExistingFormProps> = ({
  className,
  selectedWord,
  setSelectedWord,
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Word[]>([]);
  const [forms, setForms] = useState<WordForm[]>([]);
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

  // Fetch single word details when selectedWord changes
  useEffect(() => {
    if (!selectedWord) return;
    (async () => {
      const res = await fetch(`/api/dictionary/${selectedWord.headword}`);
      if (res.ok) {
        const data = await res.json();
        setForms((data.forms as WordForm[]) || []); // optionally set forms if present
        setIsLoading(false);
      }
    })();
  }, [selectedWord, setForms]);

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
            <div>
              <h4 className={style.formsSectionHeading}>Oblici</h4>
              {forms?.length ? (
                <div className={style.tableContainer}>
                  <table className={style.formsTable}>
                    <thead>
                      <tr>
                        <th>Kategorija</th>
                        <th>Oblik</th>
                        <th>Naziv</th>
                        <th>Vrijednost</th>
                      </tr>
                    </thead>
                    <tbody>
                      {forms.map((f, i) => (
                        <tr key={i}>
                          <td>{f.category}</td>
                          <td>{f.form}</td>
                          <td>{f.name}</td>
                          <td>{f.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className={style.emptyState}>Nema postojećih oblika.</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ExistingForm;
