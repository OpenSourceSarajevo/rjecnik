import style from './MeaningCard.module.css';

type MeaningCardProps = {
  type: string | null;
  gender: string | null;
  definition: string;
  examples: string[] | null;
};

const Examples = ({ examples }: { examples: string[] | null }) => {
  if (!examples) return <></>;

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

  let wordType = <p className={style.wordType}>{type}</p>;
  if (gender) {
    wordType = (
      <p className={style.wordType}>
        {type}, {gender} rod
      </p>
    );
  }

  return (
    <div className={style.definitionCard}>
      <div className={style.definitionHeader}>
        <span className={style.wordType}>{wordType}</span>
      </div>
      {definition}
      <Examples examples={examples} />
    </div>
  );
};

export default MeaningCard;
