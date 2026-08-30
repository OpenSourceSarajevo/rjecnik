import { Definition, WordForm } from '@/app/api/dictionary/route';
import DefinitionsForm from '@/app/(dashboard)/dictionary/components/DefinitionsForm';
import FormsForm from '@/app/(dashboard)/dictionary/components/FormsForm';
import OriginsForm from '@/app/(dashboard)/dictionary/components/OriginsForm';
import AlternativesForm from '@/app/(dashboard)/dictionary/components/AlternativesForm';

import style from './NewHeadwordForm.module.css';

type NewHeadwordFormProps = {
  className?: string;
  headword: string;
  definitions: Definition[];
  setDefinitions: React.Dispatch<React.SetStateAction<Definition[]>>;
  origins: string[];
  setOrigins: React.Dispatch<React.SetStateAction<string[]>>;
  alternatives: string[];
  setAlternatives: React.Dispatch<React.SetStateAction<string[]>>;
  forms: WordForm[];
  setForms: React.Dispatch<React.SetStateAction<WordForm[]>>;
};

const NewHeadwordForm: React.FC<NewHeadwordFormProps> = ({
  className,
  headword,
  definitions,
  setDefinitions,
  origins,
  setOrigins,
  alternatives,
  setAlternatives,
  forms,
  setForms,
}) => (
  <div className={`${style.container} ${className}`}>
    <h3 className={style.headword}>Nova riječ: {headword}</h3>

    <h4 className={style.sectionHeading}>Porijeklo</h4>
    <OriginsForm origins={origins} setOrigins={setOrigins} className={style.block} />

    <h4 className={style.sectionHeading}>Alternativni oblici</h4>
    <AlternativesForm
      alternatives={alternatives}
      setAlternatives={setAlternatives}
      className={style.block}
    />

    <h4 className={style.sectionHeading}>Definicije</h4>
    <DefinitionsForm definitions={definitions} setDefinitions={setDefinitions} className={style.block} />

    <h4 className={style.sectionHeading}>Oblici</h4>
    <FormsForm forms={forms} setForms={setForms} className={style.block} />
  </div>
);

export default NewHeadwordForm;
