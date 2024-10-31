"use client";
import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

import style from "./FaqItem.module.css";

interface FaqItemProps {
  question: string;
  answer: string;
}

const FaqItem = ({ question, answer }: FaqItemProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={style.item}>
      <button className={style.button} onClick={() => setIsOpen(!isOpen)}>
        <span>{question}</span>
        {isOpen ? (
          <ChevronUp size={20} color="var(--color-primary)" />
        ) : (
          <ChevronDown size={20} color="var(--color-primary)" />
        )}
      </button>
      {isOpen && <div className={style.answer}>{answer}</div>}
    </div>
  );
};

export default FaqItem;
