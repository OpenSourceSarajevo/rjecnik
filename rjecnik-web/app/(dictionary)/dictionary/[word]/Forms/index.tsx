import style from './Forms.module.css';

type FormsProps = {
  forms: WordForm[];
};

type WordForm = {
  form: string;
  name: string;
  value: string;
  category: string;
};

const getFormValue = (forms: WordForm[], padez: string) => {
  const form = forms.find((f) => f.name.toLowerCase() === padez.toLowerCase());
  return form ? form.value : '-';
};

type FormsTableProps = {
  title: string;
  rows: string[];
  forms: WordForm[];
};

const FormsTable = (props: FormsTableProps) => {
  const { title, rows, forms } = props;

  return (
    <>
      <h2 className={style.title}>{title}</h2>
      <table className={style.table}>
        <tbody>
          {rows.map((padez: string, index) => (
            <tr key={index}>
              <td className={style.key}>{padez}</td>
              <td className={style.value}>{getFormValue(forms, padez)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
};

const NounForms: React.FC<FormsProps> = ({ forms }) => {
  const PADEZI = [
    'nominativ',
    'genitiv',
    'dativ',
    'akuzativ',
    'vokativ',
    'lokativ',
    'instrumental',
  ];

  const singularForms = forms.filter(
    (form) => form.form === 'jednina' && form.category === 'padež'
  );
  const pluralForms = forms.filter((form) => form.form === 'množina' && form.category === 'padež');

  return (
    <div className={style.container}>
      <div className={style.section}>
        <div className={style.column}>
          <FormsTable title="Jednina" rows={PADEZI} forms={singularForms} />
        </div>

        <div className={style.column}>
          <FormsTable title="Množina" rows={PADEZI} forms={pluralForms} />
        </div>
      </div>
    </div>
  );
};

const VerbForms: React.FC<FormsProps> = ({ forms }) => {
  const VREMENA = [
    'prezent',
    'perfekt',
    'aorist',
    'imperfekt',
    'pluskvamperfekt',
    'futur i',
    'futur ii',
  ];

  const firstPersonSingularForms = forms.filter(
    (form) => form.form === '1. lice jednine' && form.category === 'glagolsko vrijeme'
  );
  const secondPersonSingularForms = forms.filter(
    (form) => form.form === '2. lice jednine' && form.category === 'glagolsko vrijeme'
  );
  const thirdPersonSingularForms = forms.filter(
    (form) => form.form === '3. lice jednine' && form.category === 'glagolsko vrijeme'
  );
  const firstPersonPluralForms = forms.filter(
    (form) => form.form === '1. lice množine' && form.category === 'glagolsko vrijeme'
  );
  const secondPersonPluralForms = forms.filter(
    (form) => form.form === '2. lice množine' && form.category === 'glagolsko vrijeme'
  );
  const thirdPersonPluralForms = forms.filter(
    (form) => form.form === '3. lice množine' && form.category === 'glagolsko vrijeme'
  );
  return (
    <div className={style.container}>
      <div className={style.section}>
        <div className={style.column}>
          <FormsTable title="1. Lice Jednine" rows={VREMENA} forms={firstPersonSingularForms} />
        </div>

        <div className={style.column}>
          <FormsTable title="1. Lice Množine" rows={VREMENA} forms={firstPersonPluralForms} />
        </div>

        <div className={style.column}>
          <FormsTable title="2. Lice Jednine" rows={VREMENA} forms={secondPersonSingularForms} />
        </div>

        <div className={style.column}>
          <FormsTable title="2. Lice Množine" rows={VREMENA} forms={secondPersonPluralForms} />
        </div>

        <div className={style.column}>
          <FormsTable title="3. Lice Jednine" rows={VREMENA} forms={thirdPersonSingularForms} />
        </div>

        <div className={style.column}>
          <FormsTable title="3. Lice Množine" rows={VREMENA} forms={thirdPersonPluralForms} />
        </div>
      </div>
    </div>
  );
};

const Forms: React.FC<FormsProps> = ({ forms }) => {
  const padezForms = forms.some((form) => form.category === 'padež');
  if (padezForms) {
    return <NounForms forms={forms} />;
  }

  const glagolForms = forms.some((form) => form.category === 'glagolsko vrijeme');
  if (glagolForms) {
    return <VerbForms forms={forms} />;
  }

  return <></>;
};

export default Forms;
