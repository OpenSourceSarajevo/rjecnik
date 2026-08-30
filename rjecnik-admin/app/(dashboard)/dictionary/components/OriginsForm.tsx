import React from 'react';
import { Plus, X } from 'lucide-react';
import style from './OriginsForm.module.css';
import Button from '@/app/components/Button';

type Props = {
  origins: string[];
  setOrigins: React.Dispatch<React.SetStateAction<string[]>>;
  className?: string;
};

const OriginsForm: React.FC<Props> = ({ origins, setOrigins, className }) => (
  <div className={`${style.wrapper} ${className}`}>
    {origins.length === 0 ? (
      <div className={style.emptyState}>
        <p>Nema dodanog porijekla.</p>
        <Button
          type="button"
          className={style.addBlockButton}
          onClick={() => setOrigins((o) => [...o, ''])}
        >
          <Plus size={14} />
          Dodaj porijeklo
        </Button>
      </div>
    ) : (
      <>
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
                type="button"
                className={style.removeBlockButton}
                aria-label="Ukloni porijeklo"
                onClick={() => setOrigins((o) => o.filter((_, i) => i !== idx))}
              >
                <X size={16} />
              </Button>
            </div>
          ))}
        </div>
        <Button
          type="button"
          className={style.addBlockButtonInline}
          onClick={() => setOrigins((o) => [...o, ''])}
        >
          <Plus size={14} />
          Dodaj porijeklo
        </Button>
      </>
    )}
  </div>
);

export default OriginsForm;
