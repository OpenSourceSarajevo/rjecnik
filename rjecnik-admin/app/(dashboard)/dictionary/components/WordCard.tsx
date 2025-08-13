import React from 'react';
import styles from './WordCard.module.css';
import { Word } from '@/app/api/dictionary/route';
import Link from 'next/link';
import { Edit } from 'lucide-react';

interface WordCardProps {
  word: Word;
}

const WordCard: React.FC<WordCardProps> = ({ word }) => {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.wordInfo}>
          <div className={styles.wordTitle}>
            <h3 className={styles.word}>{word.headword}</h3>
          </div>
          <p className={`${styles.shortDefinition} line-clamp-1`}>
            {word.definitions[0]?.definition}
          </p>
        </div>
        <div className={styles.actions}>
          <Link
            href={`/dictionary/${word.id}`}
            className={styles.actionButton}
            title="Uredi na posebnoj stranici"
          >
            <Edit size={18} />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default WordCard;
