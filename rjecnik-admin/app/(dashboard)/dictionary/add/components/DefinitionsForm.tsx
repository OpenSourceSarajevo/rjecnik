import React, { useState } from "react";
import style from "./DefinitionsForm.module.css";
import WordTypeSelect from "@/app/(dashboard)/components/WordTypeSelect";
import GenderSelect from "@/app/(dashboard)/components/GenderSelect";

type DefinitionType = {
  type: string;
  gender: string;
  examples: string[];
  definition: string;
  part_of_speech: string | null;
  synonyms: string[];
  antonyms: string[];
};

type Props = {
  definitions: DefinitionType[];
  setDefinitions: React.Dispatch<React.SetStateAction<DefinitionType[]>>;
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
        <button
          type="button"
          className={style.addBlockButton}
          onClick={() => setDefinitions(defs => [...defs, { type: '', gender: '', examples: [], definition: '', part_of_speech: '', synonyms: [], antonyms: [] }])}
        >
          +
        </button>
      </div>
      <div className={style.blocksList}>
        {definitions.map((defObj, idx) => {
          const header = `${defObj.type || ""} - ${defObj.definition?.slice(0, 20) || "Nova definicija"}`;
          return (
            <div key={idx} className={style.accordionItem}>
              <div className={style.accordionHeader} onClick={() => handleAccordion(idx)}>
                <span>{header}</span>
                <span>{openIdx === idx ? "▲" : "▼"}</span>
              </div>
              {openIdx === idx && (
                <div className={`${style.blockItem} ${style.blockItemColumn} ${style.accordionContent}`}>
                  <WordTypeSelect
                    value={defObj.type}
                    onChange={(value) => {
                      const newDefs = [...definitions];
                      newDefs[idx] = { ...newDefs[idx], type: value };
                      setDefinitions(newDefs);
                    }}
                    className={style.input}
                  />
                  {(defObj.type === "imenica" || defObj.type === "pridjev") && (
                    <GenderSelect
                      value={defObj.gender}
                      onChange={(value) => {
                        const newDefs = [...definitions];
                        newDefs[idx] = { ...newDefs[idx], gender: value };
                        setDefinitions(newDefs);
                      }}
                      className={style.input}
                    />
                  )}
                  <div className={`${style.blockSection} ${style.blockSectionNoPad}`}>
                    <div className={style.blockHeader}>
                      <span>Primjeri</span>
                      <button
                        type="button"
                        className={style.addBlockButton}
                        onClick={() => {
                          const newDefs = [...definitions];
                          newDefs[idx] = { ...newDefs[idx], examples: [...(defObj.examples || []), ''] };
                          setDefinitions(newDefs);
                        }}
                      >
                        +
                      </button>
                    </div>
                    <div className={style.blocksList}>
                      {(defObj.examples || []).map((ex, exIdx) => (
                        <div key={exIdx} className={`${style.blockItem} ${style.blockItemRow}`}>
                          <input
                            type="text"
                            value={ex}
                            className={style.input}
                            placeholder={`Primjer ${exIdx + 1}`}
                            onChange={e => {
                              const newDefs = [...definitions];
                              const newExamples = [...(defObj.examples || [])];
                              newExamples[exIdx] = e.target.value;
                              newDefs[idx] = { ...newDefs[idx], examples: newExamples };
                              setDefinitions(newDefs);
                            }}
                          />
                          <button
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
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                  <input
                    type="text"
                    value={defObj.definition}
                    className={style.input}
                    placeholder="Definicija"
                    onChange={e => {
                      const newDefs = [...definitions];
                      newDefs[idx] = { ...newDefs[idx], definition: e.target.value };
                      setDefinitions(newDefs);
                    }}
                  />
                  <input
                    type="text"
                    value={defObj.synonyms.join(', ')}
                    className={style.input}
                    placeholder="Sinonimi (zarezom odvojeni)"
                    onChange={e => {
                      const newDefs = [...definitions];
                      newDefs[idx] = { ...newDefs[idx], synonyms: e.target.value.split(',').map(s => s.trim()) };
                      setDefinitions(newDefs);
                    }}
                  />
                  <input
                    type="text"
                    value={defObj.antonyms.join(', ')}
                    className={style.input}
                    placeholder="Antonimi (zarezom odvojeni)"
                    onChange={e => {
                      const newDefs = [...definitions];
                      newDefs[idx] = { ...newDefs[idx], antonyms: e.target.value.split(',').map(s => s.trim()) };
                      setDefinitions(newDefs);
                    }}
                  />
                  <button
                    type="button"
                    className={style.removeBlockButton}
                    aria-label="Ukloni definiciju"
                    onClick={() => setDefinitions(defs => defs.filter((_, i) => i !== idx))}
                    style={{alignSelf: 'flex-end'}}
                  >
                    ×
                  </button>
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