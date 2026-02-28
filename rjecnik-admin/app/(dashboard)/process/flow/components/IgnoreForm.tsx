import { IgnoreType } from '@/app/api/words/contracts';
import style from './IgnoreForm.module.css';

const ignoreTypes: { value: IgnoreType; label: string; description: string }[] = [
  { value: 'ostalo', label: 'Ostalo', description: 'Označena za kasniji pregled' },
  {
    value: 'ime',
    label: 'Vlastito ime',
    description: 'Imenica koja nije rječnička jedinica (ime, grad, organizacija...)',
  },
  {
    value: 'strana_riječ',
    label: 'Strana riječ',
    description: 'Strana ili posuđena riječ koja se ne obrađuje',
  },
  { value: 'skraćenica', label: 'Skraćenica', description: 'Skraćenica ili akronim' },
];

type IgnoreFormProps = {
  ignoreType: IgnoreType;
  setIgnoreType: React.Dispatch<React.SetStateAction<IgnoreType>>;
};

const IgnoreForm: React.FC<IgnoreFormProps> = ({ ignoreType, setIgnoreType }) => {
  return (
    <div className={style.container}>
      <p className={style.heading}>Odaberi razlog ignoriranja:</p>
      <ul className={style.options}>
        {ignoreTypes.map(({ value, label, description }) => (
          <li
            key={value}
            className={`${style.option} ${ignoreType === value ? style.optionSelected : ''}`}
          >
            <label className={style.optionLabel}>
              <input
                type="radio"
                name="ignoreType"
                value={value}
                checked={ignoreType === value}
                onChange={() => setIgnoreType(value)}
                className={style.radio}
              />
              <div className={style.optionContent}>
                <span className={style.optionTitle}>{label}</span>
                <span className={style.optionDescription}>{description}</span>
              </div>
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default IgnoreForm;
