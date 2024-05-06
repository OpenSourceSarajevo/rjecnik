import styles from "./card.module.css";

type CardProps = {
  title: string;
  description: string;
};

const Card = (props: CardProps) => {
  const { title, description } = props;

  return (
    <div className={styles.card}>
      <h2>{title}</h2>
      <p>{description}</p>
    </div>
  );
};

export default Card;
