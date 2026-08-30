import React, { useState } from 'react';
import { Plus, X, ChevronDown, Wand2 } from 'lucide-react';
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

const CASES = ['Nominativ', 'Genitiv', 'Dativ', 'Akuzativ', 'Vokativ', 'Instrumental', 'Lokativ'];

const FormsForm: React.FC<Props> = ({ forms, setForms, className }) => {
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const [showCaseTool, setShowCaseTool] = useState(false);
  const handleAccordion = (idx: number) => {
    setOpenIdx(openIdx === idx ? null : idx);
  };
  const handleAddForm = () =>
    setForms((forms) => [...forms, { form: '', name: '', value: '', category: '' }]);

  const findCaseFormIdx = (caseName: string, broj: 'jednina' | 'množina') =>
    forms.findIndex(
      (f) => f.category === 'padež' && f.form === broj && f.name === caseName.toLowerCase()
    );

  const getCaseValue = (caseName: string, broj: 'jednina' | 'množina') => {
    const idx = findCaseFormIdx(caseName, broj);
    return idx >= 0 ? forms[idx].value : '';
  };

  const handleCaseValueChange = (caseName: string, broj: 'jednina' | 'množina', value: string) => {
    setForms((prev) => {
      const idx = findCaseFormIdx(caseName, broj);
      if (idx >= 0) {
        if (!value) return prev.filter((_, i) => i !== idx);
        const updated = [...prev];
        updated[idx] = { ...updated[idx], value };
        return updated;
      }
      if (!value) return prev;
      return [...prev, { form: broj, name: caseName.toLowerCase(), value, category: 'padež' }];
    });
  };

  return (
    <div className={`${style.wrapper} ${className}`}>
      <div className={style.caseToolToggle}>
        <Button
          type="button"
          className={style.caseToolButton}
          onClick={() => setShowCaseTool((v) => !v)}
        >
          <Wand2 size={14} />
          Brzo popuni padeže
        </Button>
      </div>
      {showCaseTool && (
        <div className={style.casePanel}>
          <div className={style.caseGrid}>
            <span />
            <span className={style.caseColumnLabel}>Jednina</span>
            <span className={style.caseColumnLabel}>Množina</span>
            {CASES.map((caseName) => (
              <React.Fragment key={caseName}>
                <span className={style.caseRowLabel}>{caseName}</span>
                <input
                  type="text"
                  className={style.input}
                  value={getCaseValue(caseName, 'jednina')}
                  onChange={(e) => handleCaseValueChange(caseName, 'jednina', e.target.value)}
                />
                <input
                  type="text"
                  className={style.input}
                  value={getCaseValue(caseName, 'množina')}
                  onChange={(e) => handleCaseValueChange(caseName, 'množina', e.target.value)}
                />
              </React.Fragment>
            ))}
          </div>
          <div className={style.casePanelFooter}>
            <Button
              type="button"
              className={style.applyCaseButton}
              onClick={() => setShowCaseTool(false)}
            >
              Zatvori
            </Button>
          </div>
        </div>
      )}
      {forms.length === 0 ? (
        <div className={style.emptyState}>
          <p>Nema dodanih oblika.</p>
          <Button type="button" className={style.addBlockButton} onClick={handleAddForm}>
            <Plus size={14} />
            Dodaj oblik
          </Button>
        </div>
      ) : (
        <div className={style.blocksList}>
          {forms.map((formObj, idx) => {
            const isOpen = openIdx === idx;
            const headerParts = [];
            if (formObj.form) headerParts.push(formObj.form);
            if (formObj.name || formObj.value) {
              headerParts.push(`${formObj.name || 'Novi oblik'} - ${formObj.value || ''}`.trim());
            }
            if (formObj.category) headerParts.push(`(${formObj.category})`);
            const header = headerParts.length > 0 ? headerParts.join(' · ') : 'Novi oblik';
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
                    <div className={style.fieldGroup}>
                      <label>Oblik</label>
                      <input
                        type="text"
                        value={formObj.form}
                        className={style.input}
                        placeholder="npr. jednina"
                        onChange={(e) => {
                          const newForms = [...forms];
                          newForms[idx] = { ...newForms[idx], form: e.target.value };
                          setForms(newForms);
                        }}
                      />
                    </div>
                    <div className={style.fieldGroup}>
                      <label>Naziv</label>
                      <input
                        type="text"
                        value={formObj.name}
                        className={style.input}
                        placeholder="npr. nominativ"
                        onChange={(e) => {
                          const newForms = [...forms];
                          newForms[idx] = { ...newForms[idx], name: e.target.value };
                          setForms(newForms);
                        }}
                      />
                    </div>
                    <div className={style.fieldGroup}>
                      <label>Vrijednost</label>
                      <input
                        type="text"
                        value={formObj.value}
                        className={style.input}
                        placeholder="npr. aba"
                        onChange={(e) => {
                          const newForms = [...forms];
                          newForms[idx] = { ...newForms[idx], value: e.target.value };
                          setForms(newForms);
                        }}
                      />
                    </div>
                    <div className={style.fieldGroup}>
                      <label>Kategorija</label>
                      <input
                        type="text"
                        value={formObj.category}
                        className={style.input}
                        placeholder="npr. padež"
                        onChange={(e) => {
                          const newForms = [...forms];
                          newForms[idx] = { ...newForms[idx], category: e.target.value };
                          setForms(newForms);
                        }}
                      />
                    </div>
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
      {forms.length > 0 && (
        <Button type="button" className={style.addBlockButtonInline} onClick={handleAddForm}>
          <Plus size={14} />
          Dodaj oblik
        </Button>
      )}
    </div>
  );
};

export default FormsForm;
