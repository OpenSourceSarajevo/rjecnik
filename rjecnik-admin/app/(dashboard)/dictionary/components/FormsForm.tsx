import React, { useState } from 'react';
import style from './FormsForm.module.css';
import Button from '@/app/components/Button';

type FormType = {
  form: string;
  name: string;
  value: string;
  category: string;
};

type Props = {
  forms: FormType[];
  setForms: React.Dispatch<React.SetStateAction<FormType[]>>;
  className?: string;
};

const FormsForm: React.FC<Props> = ({ forms, setForms, className }) => {
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
            setForms((forms) => [...forms, { form: '', name: '', value: '', category: '' }])
          }
        >
          +
        </Button>
      </div>
      <div className={style.blocksList}>
        {forms.map((formObj, idx) => {
          const header = `${formObj.name || 'Novi oblik'} - ${formObj.value || ''}`;
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
                  <input
                    type="text"
                    value={formObj.form}
                    className={style.input}
                    placeholder="Oblik (npr. jednina)"
                    onChange={(e) => {
                      const newForms = [...forms];
                      newForms[idx] = { ...newForms[idx], form: e.target.value };
                      setForms(newForms);
                    }}
                  />
                  <input
                    type="text"
                    value={formObj.name}
                    className={style.input}
                    placeholder="Naziv (npr. nominativ)"
                    onChange={(e) => {
                      const newForms = [...forms];
                      newForms[idx] = { ...newForms[idx], name: e.target.value };
                      setForms(newForms);
                    }}
                  />
                  <input
                    type="text"
                    value={formObj.value}
                    className={style.input}
                    placeholder="Vrijednost (npr. aba)"
                    onChange={(e) => {
                      const newForms = [...forms];
                      newForms[idx] = { ...newForms[idx], value: e.target.value };
                      setForms(newForms);
                    }}
                  />
                  <input
                    type="text"
                    value={formObj.category}
                    className={style.input}
                    placeholder="Kategorija (npr. padež)"
                    onChange={(e) => {
                      const newForms = [...forms];
                      newForms[idx] = { ...newForms[idx], category: e.target.value };
                      setForms(newForms);
                    }}
                  />
                  <Button
                    type="button"
                    className={style.removeBlockButton}
                    aria-label="Ukloni oblik"
                    onClick={() => setForms((forms) => forms.filter((_, i) => i !== idx))}
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

export default FormsForm;
