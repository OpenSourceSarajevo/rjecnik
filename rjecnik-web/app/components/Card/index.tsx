import Link from 'next/link';
import style from './Card.module.css';

type CardProps = {
  id: number;
  title: string;
  description: string;
  definitionsCount?: number;
  firstDefinition?: string;
};

const Card = (props: CardProps) => {
  const { id, title, description, definitionsCount, firstDefinition } = props;

  const word = encodeURIComponent(title);

  // Truncate definition to 60 characters
  const truncatedDefinition =
    firstDefinition && firstDefinition.length > 60
      ? firstDefinition.substring(0, 60) + '...'
      : firstDefinition;

  return (
    <Link href={`/rjecnik/${word}`}>
      <div className={style.card}>
        <div className={style.header}>
          <h2>{title}</h2>
          {definitionsCount !== undefined && (
            <span className={style.definitionCount}>
              {definitionsCount} {definitionsCount === 1 ? 'definicija' : 'definicije'}
            </span>
          )}
        </div>
        {truncatedDefinition && <p className={style.definitionPreview}>{truncatedDefinition}</p>}
        {!truncatedDefinition && description && <p>{description}</p>}
      </div>
    </Link>
  );
};

export default Card;
