import React from 'react';
import type { QualityLevel } from '@rjecnik/api';
import style from './QualityBadge.module.css';

export const LEVEL_LABELS: Record<QualityLevel, string> = {
  green: 'Potpuna',
  yellow: 'Djelimična',
  red: 'Nepotpuna',
};

type Props = {
  quality: number | null | undefined;
  level: QualityLevel | null | undefined;
  className?: string;
};

/** Coloured dot and percentage for a word's data quality score. */
const QualityBadge: React.FC<Props> = ({ quality, level, className }) => {
  if (quality === null || quality === undefined || !level) {
    return <span className={`${style.badge} ${style.unscored} ${className ?? ''}`}>—</span>;
  }

  return (
    <span
      className={`${style.badge} ${style[level]} ${className ?? ''}`}
      title={`Kvaliteta podataka: ${LEVEL_LABELS[level].toLowerCase()}`}
    >
      <span className={style.dot} aria-hidden="true" />
      {quality}%
    </span>
  );
};

export default QualityBadge;
