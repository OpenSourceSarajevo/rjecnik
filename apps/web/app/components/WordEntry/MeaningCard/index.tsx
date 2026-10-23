import RelatedWords from '../RelatedWords';

import style from './MeaningCard.module.css';

type MeaningCardProps = {
  type: string | null;
  gender: string | null;
  definition: string | null;
  examples: string[] | null;
  synonyms: string[] | null;
  antonyms: string[] | null;
};

const Examples = ({ examples }: { examples: string[] | null }) => {
  if (!examples || examples.length === 0) return null;

  return (
    <>
      {examples.map((example, i) => (
        <blockquote key={i} className={style.example}>
          {example}
        </blockquote>
      ))}
    </>
  );
};

const MeaningCard = (props: MeaningCardProps) => {
  const { type, gender, definition, examples, synonyms, antonyms } = props;

  const safeType = typeof type === 'string' ? type.trim() : '';
  const safeDefinition = typeof definition === 'string' ? definition.trim() : '';

  if (!safeType && !safeDefinition) {
    return null;
  }

  const typeLabel = safeType ? (gender ? `${safeType}, ${gender} rod` : safeType) : null;

  return (
    <li className={style.meaning}>
      <div className={style.content}>
        {typeLabel && <span className={style.wordType}>{typeLabel}</span>}
        {safeDefinition && <p className={style.definition}>{safeDefinition}</p>}
        <Examples examples={examples} />
        <RelatedWords label="Sinonimi" words={synonyms} />
        <RelatedWords label="Antonimi" words={antonyms} />
      </div>
    </li>
  );
};

export default MeaningCard;
