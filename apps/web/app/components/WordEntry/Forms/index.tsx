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

// Which field of a form holds the row label: the case or tense (`name`), or the gender (`form`)
type RowField = 'name' | 'form';

const getFormValue = (forms: WordForm[], row: string, rowField: RowField) => {
  const form = forms.find((f) => f[rowField].toLowerCase() === row.toLowerCase());
  return form ? form.value : '-';
};

type FormsTableProps = {
  title: string;
  rows: string[];
  forms: WordForm[];
  rowField?: RowField;
};

const FormsTable = (props: FormsTableProps) => {
  const { title, rows, forms, rowField = 'name' } = props;

  return (
    <>
      <h3 className={style.title}>{title}</h3>
      <table className={style.table}>
        <tbody>
          {rows.map((row: string, index) => (
            <tr key={index}>
              <td className={style.key}>{row}</td>
              <td className={style.value}>{getFormValue(forms, row, rowField)}</td>
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
    <section className={style.container} aria-labelledby="oblici">
      <h2 id="oblici" className={style.heading}>
        Oblici riječi
      </h2>
      <div className={style.section}>
        <div className={style.column}>
          <FormsTable title="Jednina" rows={PADEZI} forms={singularForms} />
        </div>

        <div className={style.column}>
          <FormsTable title="Množina" rows={PADEZI} forms={pluralForms} />
        </div>
      </div>
    </section>
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
    <section className={style.container} aria-labelledby="oblici">
      <h2 id="oblici" className={style.heading}>
        Oblici riječi
      </h2>
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
    </section>
  );
};

const ComparisonForms: React.FC<FormsProps> = ({ forms }) => {
  const RODOVI = ['muški', 'ženski', 'srednji'];

  const comparativeForms = forms.filter(
    (form) => form.name === 'komparativ' && form.category === 'komparacija'
  );
  const superlativeForms = forms.filter(
    (form) => form.name === 'superlativ' && form.category === 'komparacija'
  );

  return (
    <section className={style.container} aria-labelledby="oblici">
      <h2 id="oblici" className={style.heading}>
        Komparacija
      </h2>
      <div className={style.section}>
        <div className={style.column}>
          <FormsTable title="Komparativ" rows={RODOVI} forms={comparativeForms} rowField="form" />
        </div>

        <div className={style.column}>
          <FormsTable title="Superlativ" rows={RODOVI} forms={superlativeForms} rowField="form" />
        </div>
      </div>
    </section>
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

  const comparisonForms = forms.some((form) => form.category === 'komparacija');
  if (comparisonForms) {
    return <ComparisonForms forms={forms} />;
  }

  return <></>;
};

export default Forms;
