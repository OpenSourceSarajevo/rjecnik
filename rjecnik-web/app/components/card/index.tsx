import styles from "./card.module.css";

interface ICardProps {
  title: string;
  description: string;
}

type CardProps<T extends React.ElementType> = ICardProps &
  React.ComponentPropsWithRef<T>;

const Card = <T extends React.ElementType = "div">(props: CardProps<T>) => {
  const { title, description, ...rest } = props;

  return (
    <div className={styles.card} {...rest}>
      <h2>{title}</h2>
      <p>{description}</p>
    </div>
  );
};

export default Card;
