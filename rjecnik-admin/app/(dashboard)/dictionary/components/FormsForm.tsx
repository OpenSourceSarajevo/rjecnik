import React, { useState } from 'react';
import { Plus, X, ChevronDown } from 'lucide-react';
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
          className={style.addBlockButton}
          onClick={() =>
            setForms((forms) => [...forms, { form: '', name: '', value: '', category: '' }])
          }
        >
          <Plus size={14} />
          Dodaj oblik
        </Button>
      </div>
      {forms.length === 0 ? (
        <p className={style.emptyState}>Nema dodanih oblika.</p>
      ) : (
        <div className={style.blocksList}>
          {forms.map((formObj, idx) => {
            const isOpen = openIdx === idx;
            const header = formObj.name || formObj.value ? `${formObj.name || 'Novi oblik'} — ${formObj.value || ''}` : 'Novi oblik';
            return (
              <div key={idx} className={style.accordionItem}>
                <button
                  type="button"
                  className={style.accordionHeader}
                  onClick={() => handleAccordion(idx)}
                  aria-expanded={isOpen}
                >
                  <span className={style.accordionTitle}>{header}</span>
                  <ChevronDown
                    size={16}
                    className={isOpen ? style.accordionChevronOpen : style.accordionChevron}
                  />
                </button>
                {isOpen && (
                  <div className={style.accordionContent}>
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
                    <div className={style.footerRow}>
                      <Button
                        type="button"
                        className={style.removeBlockButton}
                        onClick={() => setForms((forms) => forms.filter((_, i) => i !== idx))}
                      >
                        <X size={14} />
                        Ukloni oblik
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

export default FormsForm;
