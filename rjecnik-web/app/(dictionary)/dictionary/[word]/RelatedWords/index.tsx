import React from "react";
import Link from "next/link";
import { ArrowLeftRight, ArrowRight } from "lucide-react";

import style from "./RelatedWords.module.css";

interface RelatedWordsProps {
  synonyms: string[];
  antonyms: string[];
}

const RelatedWords: React.FC<RelatedWordsProps> = ({ synonyms, antonyms }) => {
  return (
    <section className={style.container}>
      {synonyms.length > 0 && (
        <div className={style.section}>
          <h2 className={style.title}>
            <ArrowRight className={style.titleIcon} size={20} />
            Sinonimi
          </h2>
          <div className={style.wordList}>
            {synonyms.map((word, index) => (
              <Link
                key={index}
                className={style.wordCard}
                href={`/rjecnik/${encodeURIComponent(word)}`}
              >
                <div className={style.wordText}>{word}</div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {antonyms.length > 0 && (
        <div className={style.section}>
          <h2 className={style.title}>
            <ArrowLeftRight className={style.titleIcon} size={20} />
            Antonimi
          </h2>
          <div className={style.wordList}>
            {antonyms.map((word, index) => (
              <Link
                key={index}
                className={style.wordCard}
                href={`/rjecnik/${encodeURIComponent(word)}`}
              >
                <div className={style.wordText}>{word}</div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};

export default RelatedWords;
