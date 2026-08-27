import React, { useState } from 'react';
import { Plus, X, ChevronDown } from 'lucide-react';
import style from './DefinitionsForm.module.css';
import WordTypeSelect from '@/app/(dashboard)/components/WordTypeSelect';
import GenderSelect from '@/app/(dashboard)/components/GenderSelect';
import { Definition } from '@/app/api/dictionary/route';
import Button from '@/app/components/Button';

type Props = {
  definitions: Definition[];
  setDefinitions: React.Dispatch<React.SetStateAction<Definition[]>>;
  className?: string;
};

const DefinitionsForm: React.FC<Props> = ({ definitions, setDefinitions, className }) => {
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const handleAccordion = (idx: number) => {
    setOpenIdx(openIdx === idx ? null : idx);
  };
  return (
    <div className={`${style.blockSection} ${className}`}>
      <div className={style.blockHeader}>
        <Button
          type="button"
          className={style.addBlockButton}
          onClick={() =>
            setDefinitions((defs) => [
              ...defs,
              {
                type: '',
                gender: '',
                examples: [],
                definition: '',
                hidden_definition: '',
                part_of_speech: null,
                synonyms: [],
                antonyms: [],
                pronunciation_ipa: null,
                pronunciation_audio: null,
              },
            ])
          }
        >
          <Plus size={14} />
          Dodaj definiciju
        </Button>
      </div>
      {definitions.length === 0 ? (
        <p className={style.emptyState}>Nema dodanih definicija.</p>
      ) : (
        <div className={style.blocksList}>
          {definitions.map((defObj, idx) => {
            const isOpen = openIdx === idx;
            const preview = defObj.definition?.trim() || 'Nova definicija';
            return (
              <div key={idx} className={style.accordionItem}>
                <button
                  type="button"
                  className={style.accordionHeader}
                  onClick={() => handleAccordion(idx)}
                  aria-expanded={isOpen}
                >
                  <span className={style.accordionTitle}>
                    {defObj.type && <span className={style.accordionType}>{defObj.type}</span>}
                    {preview}
                  </span>
                  <ChevronDown
                    size={16}
                    className={isOpen ? style.accordionChevronOpen : style.accordionChevron}
                  />
                </button>
                {isOpen && (
                  <div className={style.accordionContent}>
                    <div className={style.fieldRow}>
                      <div className={style.fieldGroup}>
                        <label>Vrsta riječi</label>
                        <WordTypeSelect
                          value={defObj.type || ''}
                          onChange={(value) => {
                            const newDefs = [...definitions];
                            newDefs[idx] = { ...newDefs[idx], type: value || null };
                            setDefinitions(newDefs);
                          }}
                        />
                      </div>
                      {(defObj.type === 'imenica' || defObj.type === 'pridjev') && (
                        <div className={style.fieldGroup}>
                          <label>Rod</label>
                          <GenderSelect
                            value={defObj.gender || ''}
                            onChange={(value) => {
                              const newDefs = [...definitions];
                              newDefs[idx] = { ...newDefs[idx], gender: value || null };
                              setDefinitions(newDefs);
                            }}
                          />
                        </div>
                      )}
                    </div>

                    <div className={style.fieldGroup}>
                      <label>Definicija</label>
                      <textarea
                        value={defObj.definition}
                        className={style.textarea}
                        placeholder="Unesi definiciju..."
                        rows={3}
                        onChange={(e) => {
                          const newDefs = [...definitions];
                          newDefs[idx] = { ...newDefs[idx], definition: e.target.value };
                          setDefinitions(newDefs);
                        }}
                      />
                    </div>

                    <div className={style.subSection}>
                      <div className={style.subSectionHeader}>
                        <span>Primjeri</span>
                        <Button
                          type="button"
                          className={style.addExampleButton}
                          onClick={() => {
                            const newDefs = [...definitions];
                            newDefs[idx] = {
                              ...newDefs[idx],
                              examples: [...(defObj.examples || []), ''],
                            };
                            setDefinitions(newDefs);
                          }}
                        >
                          <Plus size={13} />
                          Dodaj primjer
                        </Button>
                      </div>
                      {(defObj.examples || []).map((ex, exIdx) => (
                        <div key={exIdx} className={style.exampleRow}>
                          <input
                            type="text"
                            value={ex}
                            className={style.input}
                            placeholder={`Primjer ${exIdx + 1}`}
                            onChange={(e) => {
                              const newDefs = [...definitions];
                              const newExamples = [...(defObj.examples || [])];
                              newExamples[exIdx] = e.target.value;
                              newDefs[idx] = { ...newDefs[idx], examples: newExamples };
                              setDefinitions(newDefs);
                            }}
                          />
                          <Button
                            type="button"
                            className={style.removeExampleButton}
                            aria-label="Ukloni primjer"
                            onClick={() => {
                              const newDefs = [...definitions];
                              const newExamples = [...(defObj.examples || [])];
                              newExamples.splice(exIdx, 1);
                              newDefs[idx] = { ...newDefs[idx], examples: newExamples };
                              setDefinitions(newDefs);
                            }}
                          >
                            <X size={16} />
                          </Button>
                        </div>
                      ))}
                    </div>

                    <div className={style.fieldRow}>
                      <div className={style.fieldGroup}>
                        <label>Sinonimi</label>
                        <input
                          type="text"
                          value={(defObj.synonyms || []).join(', ')}
                          className={style.input}
                          placeholder="Zarezom odvojeni"
                          onChange={(e) => {
                            const newDefs = [...definitions];
                            newDefs[idx] = {
                              ...newDefs[idx],
                              synonyms: e.target.value.split(',').map((s) => s.trim()),
                            };
                            setDefinitions(newDefs);
                          }}
                        />
                      </div>
                      <div className={style.fieldGroup}>
                        <label>Antonimi</label>
                        <input
                          type="text"
                          value={(defObj.antonyms || []).join(', ')}
                          className={style.input}
                          placeholder="Zarezom odvojeni"
                          onChange={(e) => {
                            const newDefs = [...definitions];
                            newDefs[idx] = {
                              ...newDefs[idx],
                              antonyms: e.target.value.split(',').map((s) => s.trim()),
                            };
                            setDefinitions(newDefs);
                          }}
                        />
                      </div>
                    </div>

                    <div className={style.footerRow}>
                      <Button
                        type="button"
                        className={style.removeBlockButton}
                        onClick={() => setDefinitions((defs) => defs.filter((_, i) => i !== idx))}
                      >
                        <X size={14} />
                        Ukloni definiciju
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DefinitionsForm;
