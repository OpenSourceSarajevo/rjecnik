import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

import style from './Card.module.css';

type CardProps = {
  title: string;
  definitionsCount?: number;
  firstDefinition?: string;
};

const Card = (props: CardProps) => {
  const { title, definitionsCount, firstDefinition } = props;

  return (
    <Link href={`/rjecnik/${encodeURIComponent(title)}`} className={style.card}>
      <div className={style.body}>
        <h2 className={style.word}>{title}</h2>
        {firstDefinition && <p className={style.definition}>{firstDefinition}</p>}
      </div>
      {definitionsCount !== undefined && definitionsCount > 1 && (
        <span className={style.count}>+{definitionsCount - 1}</span>
      )}
      <ChevronRight className={style.chevron} size={18} aria-hidden="true" />
    </Link>
  );
};

export default Card;
