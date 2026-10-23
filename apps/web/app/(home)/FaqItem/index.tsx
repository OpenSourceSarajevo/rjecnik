import { ChevronDown } from 'lucide-react';

import style from './FaqItem.module.css';

interface FaqItemProps {
  question: string;
  answer: string;
}

const FaqItem = ({ question, answer }: FaqItemProps) => {
  return (
    <details className={style.item}>
      <summary className={style.question}>
        <span>{question}</span>
        <ChevronDown className={style.chevron} size={20} aria-hidden="true" />
      </summary>
      <p className={style.answer}>{answer}</p>
    </details>
  );
};

export default FaqItem;
