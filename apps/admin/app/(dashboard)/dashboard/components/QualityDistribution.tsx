import React from 'react';
import type { QualityDistribution as Distribution, QualityLevel } from '@rjecnik/api';
import { LEVEL_LABELS } from '../../components/QualityBadge';
import style from './QualityDistribution.module.css';

const LEVELS: QualityLevel[] = ['green', 'yellow', 'red'];

const percent = (n: number, total: number) => (total ? Math.round((100 * n) / total) : 0);

/** Number of words per data quality level. */
const QualityDistribution: React.FC<{ distribution: Distribution }> = ({ distribution }) => (
  <div>
    <h2 className={style.subTitle}>Riječi po kvaliteti</h2>
    <div className={style.tiles}>
      {LEVELS.map((level) => (
        <div key={level} className={`${style.tile} ${style[level]}`}>
          <span className={style.label}>{LEVEL_LABELS[level]}</span>
          <span className={style.value}>{distribution[level].toLocaleString('bs-BA')}</span>
          <span className={style.share}>
            {percent(distribution[level], distribution.total)}% riječi
          </span>
        </div>
      ))}
    </div>
    {distribution.unscored > 0 && (
      <p className={style.note}>
        {distribution.unscored.toLocaleString('bs-BA')} riječi još nije ocijenjeno.
      </p>
    )}
  </div>
);

export default QualityDistribution;
