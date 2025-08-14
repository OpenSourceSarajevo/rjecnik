import { useEffect, useState } from 'react';
import { NewWord } from '@/app/api/words/contracts';
import style from './NewForm.module.css';
import { Word, WordForm } from '@/app/api/dictionary/route';
import Button from '@/app/components/Button';

type NewFormProps = {
  word: NewWord;
  className?: string;
  forms: WordForm[];
  setForms: React.Dispatch<React.SetStateAction<WordForm[]>>;
  selectedWord: Word | null;
  setSelectedWord: React.Dispatch<React.SetStateAction<Word | null>>;
};

const NewForm: React.FC<NewFormProps> = ({
  word,
  className,
  forms,
  setForms,
  selectedWord,
  setSelectedWord,
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Word[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [newForm, setNewForm] = useState<WordForm>({
    form: '',
    name: '',
    value: word.headword,
    category: '',
  });

  useEffect(() => {
    if (!query) {
      setResults([]);
      return;
    }
    const timeout = setTimeout(async () => {
      const res = await fetch(`/api/dictionary?pageNumber=0&pageSize=5&word=${query}`);
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
        setForms(data.forms || []); // optionally set forms if present
        setIsLoading(false);
      }
    })();
  }, [selectedWord, setForms]);

  const handleFormChange = (field: keyof WordForm, value: string) => {
    setNewForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddForm = () => {
    setForms((prev) => [...prev, newForm]);
    setNewForm({ form: '', name: '', value: word.headword, category: '' });
  };

  return (
    <div className={`${style.container} ${className}`}>
      {!selectedWord && (
        <div className={style.searchSection}>
          <label>Pronađi riječ:</label>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className={style.input}
          />
          <ul className={style.results}>
            {results.map((word) => (
              <li
                key={word.id}
                onClick={() => {
                  setIsLoading(true);
                  setSelectedWord(word);
                }}
                className={style.resultItem}
              >
                {word.headword}
              </li>
            ))}
          </ul>
        </div>
      )}

      {selectedWord && (
        <div>
          <h3 className={style.headword}>Riječ: {selectedWord.headword}</h3>

          {!isLoading && (
            <div className={style.forms}>
              <div className={style.formSection}>
                <h4 className={style.formsSectionHeading}>Dodajte novi oblik</h4>
                <div className={style.formFields}>
                  <label className={style.formLabel}>
                    Kategorija:
                    <input
                      type="text"
                      value={newForm.category}
                      onChange={(e) => handleFormChange('category', e.target.value)}
                      className={style.input}
                    />
                  </label>
                  <label className={style.formLabel}>
                    Oblik:
                    <input
                      type="text"
                      value={newForm.form}
                      onChange={(e) => handleFormChange('form', e.target.value)}
                      className={style.input}
                    />
                  </label>
                  <label className={style.formLabel}>
                    Naziv:
                    <input
                      type="text"
                      value={newForm.name}
                      onChange={(e) => handleFormChange('name', e.target.value)}
                      className={style.input}
                    />
                  </label>

                  <label className={style.formLabel}>
                    Vrijednost:
                    <input
                      type="text"
                      value={newForm.value}
                      onChange={(e) => handleFormChange('value', e.target.value)}
                      className={style.input}
                    />
                  </label>

                  <Button onClick={handleAddForm}>Dodaj oblik</Button>
                </div>
              </div>
              <div className={style.formSection}>
                <h4 className={style.formsSectionHeading}>Postojući oblici</h4>
                <table className={style.formsTable}>
                  <thead>
                    <tr className={style.tableHeader}>
                      <th>Kategorija</th>
                      <th>Oblik</th>
                      <th>Naziv</th>
                      <th>Vrijednost</th>
                    </tr>
                  </thead>
                  <tbody>
                    {forms?.map((f, i) => (
                      <tr key={i} className={style.tableRow}>
                        <td>{f.category}</td>
                        <td>{f.form}</td>
                        <td>{f.name}</td>
                        <td>{f.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NewForm;
