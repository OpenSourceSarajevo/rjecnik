import style from './MeaningCard.module.css';

type MeaningCardProps = {
  type: string | null;
  gender: string | null;
  definition: string | null;
  examples: string[] | null;
};

const Examples = ({ examples }: { examples: string[] | null }) => {
  if (!examples || examples.length === 0) return null;

  return (
    <>
      {examples.map((example, i) => (
        <p key={i} className={style.example}>
          {`"${example}"`}
        </p>
      ))}
    </>
  );
};

const MeaningCard = (props: MeaningCardProps) => {
  const { type, gender, definition, examples } = props;

  const safeType = typeof type === 'string' ? type.trim() : '';
  const safeDefinition = typeof definition === 'string' ? definition.trim() : '';

  if (!safeType && !safeDefinition) {
    return null;
  }

  const typeLabel = safeType ? (gender ? `${safeType}, ${gender} rod` : safeType) : null;

  return (
    <div className={style.definitionCard}>
      {typeLabel && (
        <div className={style.definitionHeader}>
          <span className={style.wordType}>{typeLabel}</span>
        </div>
      )}
      {safeDefinition && <p>{safeDefinition}</p>}
      <Examples examples={examples} />
    </div>
  );
};

export default MeaningCard;
