import React from 'react';
import style from './AlternativesForm.module.css';
import Button from '@/app/components/Button';

type Props = {
  alternatives: string[];
  setAlternatives: React.Dispatch<React.SetStateAction<string[]>>;
  className?: string;
};

const AlternativesForm: React.FC<Props> = ({ alternatives, setAlternatives, className }) => (
  <div className={`${style.blockSection} ${className}`}>
    <div className={style.blockHeader}>
      <Button
        type="button"
        className={style.addBlockButton}
        onClick={() => setAlternatives((a) => [...a, ''])}
      >
        +
      </Button>
    </div>
    <div className={style.blocksList}>
      {alternatives.map((alt, idx) => (
        <div
          key={idx}
          className={style.blockItem}
          style={{ display: 'flex', alignItems: 'center' }}
        >
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
            ×
          </Button>
        </div>
      ))}
    </div>
  </div>
);

export default AlternativesForm;
