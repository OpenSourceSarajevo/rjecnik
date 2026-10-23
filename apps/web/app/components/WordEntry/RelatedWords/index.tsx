import Link from 'next/link';

import style from './RelatedWords.module.css';

type RelatedWordsProps = {
  label: string;
  words: string[] | null;
};

const RelatedWords = ({ label, words }: RelatedWordsProps) => {
  if (!words || words.length === 0) return null;

  return (
    <div className={style.row}>
      <span className={style.label}>{label}</span>
      {words.map((word) => (
        <Link key={word} className={style.word} href={`/rjecnik/${encodeURIComponent(word)}`}>
          {word}
        </Link>
      ))}
    </div>
  );
};

export default RelatedWords;
