import React from 'react';
import style from './OriginsForm.module.css';
import Button from '@/app/components/Button';

type Props = {
  origins: string[];
  setOrigins: React.Dispatch<React.SetStateAction<string[]>>;
  className?: string;
};

const OriginsForm: React.FC<Props> = ({ origins, setOrigins, className }) => (
  <div className={`${style.blockSection} ${className}`}>
    <div className={style.blockHeader}>
      <Button
        type="button"
        className={style.addBlockButton}
        onClick={() => setOrigins((o) => [...o, ''])}
      >
        +
      </Button>
    </div>
    <div className={style.blocksList}>
      {origins.map((origin, idx) => (
        <div key={idx} className={style.blockItem}>
          <input
            type="text"
            value={origin}
            className={style.input}
            placeholder={`Porijeklo ${idx + 1}`}
            onChange={(e) => {
              const newOrigins = [...origins];
              newOrigins[idx] = e.target.value;
              setOrigins(newOrigins);
            }}
          />
          <Button
            className={style.removeBlockButton}
            aria-label="Ukloni porijeklo"
            onClick={() => setOrigins((o) => o.filter((_, i) => i !== idx))}
          >
            ×
          </Button>
        </div>
      ))}
    </div>
  </div>
);

export default OriginsForm;
