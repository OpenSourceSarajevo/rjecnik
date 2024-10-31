import Link from "next/link";
import style from "./Card.module.css";

type CardProps = {
  id: number;
  title: string;
  description: string;
};

const Card = (props: CardProps) => {
  const { id, title, description } = props;

  // In case the word contains a slash (/), e.g A/a
  const word = title.split("/")[0];

  return (
    <Link href={`/rjecnik/${word}/${id}`}>
      <div className={style.card}>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
    </Link>
  );
};

export default Card;
