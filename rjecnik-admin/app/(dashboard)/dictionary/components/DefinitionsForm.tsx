import React, { useState } from 'react';
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
          onClick={() =>
            setDefinitions((defs) => [
              ...defs,
              {
                type: '',
                gender: '',
                examples: [],
                definition: '',
                part_of_speech: null,
                synonyms: [],
                antonyms: [],
                pronunciation_ipa: null,
                pronunciation_audio: null,
              },
            ])
          }
        >
          +
        </Button>
      </div>
      <div className={style.blocksList}>
        {definitions.map((defObj, idx) => {
          const header = `${defObj.type || ''} - ${defObj.definition?.slice(0, 20) || 'Nova definicija'}`;
          return (
            <div key={idx} className={style.accordionItem}>
              <div className={style.accordionHeader} onClick={() => handleAccordion(idx)}>
                <span>{header}</span>
                <span>{openIdx === idx ? '▲' : '▼'}</span>
              </div>
              {openIdx === idx && (
                <div
                  className={`${style.blockItem} ${style.blockItemColumn} ${style.accordionContent}`}
                >
                  <WordTypeSelect
                    value={defObj.type || ''}
                    onChange={(value) => {
                      const newDefs = [...definitions];
                      newDefs[idx] = { ...newDefs[idx], type: value || null };
                      setDefinitions(newDefs);
                    }}
                    className={style.input}
                  />
                  {(defObj.type === 'imenica' || defObj.type === 'pridjev') && (
                    <GenderSelect
                      value={defObj.gender || ''}
                      onChange={(value) => {
                        const newDefs = [...definitions];
                        newDefs[idx] = { ...newDefs[idx], gender: value || null };
                        setDefinitions(newDefs);
                      }}
                      className={style.input}
                    />
                  )}
                  <div className={`${style.blockSection} ${style.blockSectionNoPad}`}>
                    <div className={style.blockHeader}>
                      <span>Primjeri</span>
                      <Button
                        type="button"
                        onClick={() => {
                          const newDefs = [...definitions];
                          newDefs[idx] = {
                            ...newDefs[idx],
                            examples: [...(defObj.examples || []), ''],
                          };
                          setDefinitions(newDefs);
                        }}
                      >
                        +
                      </Button>
                    </div>
                    <div className={style.blocksList}>
                      {(defObj.examples || []).map((ex, exIdx) => (
                        <div key={exIdx} className={`${style.blockItem} ${style.blockItemRow}`}>
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
                            className={style.removeBlockButton}
                            aria-label="Ukloni primjer"
                            onClick={() => {
                              const newDefs = [...definitions];
                              const newExamples = [...(defObj.examples || [])];
                              newExamples.splice(exIdx, 1);
                              newDefs[idx] = { ...newDefs[idx], examples: newExamples };
                              setDefinitions(newDefs);
                            }}
                          >
                            ×
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                  <input
                    type="text"
                    value={defObj.definition}
                    className={style.input}
                    placeholder="Definicija"
                    onChange={(e) => {
                      const newDefs = [...definitions];
                      newDefs[idx] = { ...newDefs[idx], definition: e.target.value };
                      setDefinitions(newDefs);
                    }}
                  />
                  <input
                    type="text"
                    value={(defObj.synonyms || []).join(', ')}
                    className={style.input}
                    placeholder="Sinonimi (zarezom odvojeni)"
                    onChange={(e) => {
                      const newDefs = [...definitions];
                      newDefs[idx] = {
                        ...newDefs[idx],
                        synonyms: e.target.value.split(',').map((s) => s.trim()),
                      };
                      setDefinitions(newDefs);
                    }}
                  />
                  <input
                    type="text"
                    value={(defObj.antonyms || []).join(', ')}
                    className={style.input}
                    placeholder="Antonimi (zarezom odvojeni)"
                    onChange={(e) => {
                      const newDefs = [...definitions];
                      newDefs[idx] = {
                        ...newDefs[idx],
                        antonyms: e.target.value.split(',').map((s) => s.trim()),
                      };
                      setDefinitions(newDefs);
                    }}
                  />
                  <Button
                    type="button"
                    className={style.removeBlockButton}
                    aria-label="Ukloni definiciju"
                    onClick={() => setDefinitions((defs) => defs.filter((_, i) => i !== idx))}
                  >
                    ×
                  </Button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DefinitionsForm;
