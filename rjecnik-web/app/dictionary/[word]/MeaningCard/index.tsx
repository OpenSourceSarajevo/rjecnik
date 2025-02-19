import style from "./MeaningCard.module.css";

type MeaningCardProps = {
  type: string | null;
  gender: string | null;
  definition: string;
};

const MeaningCard = (props: MeaningCardProps) => {
  const { type, gender, definition } = props;

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
    </div>
  );
};

export default MeaningCard;
