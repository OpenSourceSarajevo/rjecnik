import Link from "next/link";
import style from "./Card.module.css";

type CardProps = {
  id: number;
  title: string;
  description: string;
};

const Card = (props: CardProps) => {
  const { id, title, description } = props;
 
  const word =  encodeURIComponent(title);
  return (
    <Link href={`/rjecnik/${word}`}>
      <div className={style.card}>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
    </Link>
  );
};

export default Card;
