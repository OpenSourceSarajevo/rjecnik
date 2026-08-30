import React from 'react';
import { Plus, X } from 'lucide-react';
import style from './AlternativesForm.module.css';
import Button from '@/app/components/Button';

type Props = {
  alternatives: string[];
  setAlternatives: React.Dispatch<React.SetStateAction<string[]>>;
  className?: string;
};

const AlternativesForm: React.FC<Props> = ({ alternatives, setAlternatives, className }) => (
  <div className={`${style.wrapper} ${className}`}>
    {alternatives.length === 0 ? (
      <div className={style.emptyState}>
        <p>Nema dodanih alternativnih oblika.</p>
        <Button
          type="button"
          className={style.addBlockButton}
          onClick={() => setAlternatives((a) => [...a, ''])}
        >
          <Plus size={14} />
          Dodaj oblik
        </Button>
      </div>
    ) : (
      <>
        <div className={style.blocksList}>
          {alternatives.map((alt, idx) => (
            <div key={idx} className={style.blockItem}>
              <input
                type="text"
                value={alt}
                className={style.input}
                placeholder={`Alternativni oblik ${idx + 1}`}
                onChange={(e) => {
                  const newAlts = [...alternatives];
                  newAlts[idx] = e.target.value;
                  setAlternatives(newAlts);
                }}
              />
              <Button
                type="button"
                className={style.removeBlockButton}
                aria-label="Ukloni alternativni oblik"
                onClick={() => setAlternatives((a) => a.filter((_, i) => i !== idx))}
              >
                <X size={16} />
              </Button>
            </div>
          ))}
        </div>
        <Button
          type="button"
          className={style.addBlockButtonInline}
          onClick={() => setAlternatives((a) => [...a, ''])}
        >
          <Plus size={14} />
          Dodaj oblik
        </Button>
      </>
    )}
  </div>
);

export default AlternativesForm;
