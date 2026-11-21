'use client';

import React, { useEffect, useState } from 'react';
import { CheckCircle2, ChevronDown, CircleDashed, XCircle } from 'lucide-react';
import type { Definition, QualityBreakdown, QualityRuleResult, WordForm } from '@rjecnik/api';
import { api } from '@/utils/api';
import QualityBadge from '../../components/QualityBadge';
import style from './QualityPanel.module.css';

type Props = {
  definitions: Definition[];
  forms: WordForm[];
  origins: string[];
  alternatives: string[];
};

// Wait for a pause in typing before asking the API to score the draft
const PREVIEW_DELAY_MS = 600;

const formatPoints = (n: number) => String(Math.round(n * 10) / 10).replace('.', ',');

const RuleIcon: React.FC<{ rule: QualityRuleResult }> = ({ rule }) => {
  if (rule.earned >= rule.points) return <CheckCircle2 size={16} className={style.iconDone} />;
  if (rule.earned > 0) return <CircleDashed size={16} className={style.iconPartial} />;
  return <XCircle size={16} className={style.iconMissing} />;
};

/** Live data quality score of the word being edited, with a checklist of the rules. */
const QualityPanel: React.FC<Props> = ({ definitions, forms, origins, alternatives }) => {
  const [breakdown, setBreakdown] = useState<QualityBreakdown | null>(null);
  const [error, setError] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    const timeout = setTimeout(() => {
      api.quality
        .preview({ definitions, forms, origins, alternatives }, { signal: controller.signal })
        .then((data) => {
          setBreakdown(data);
          setError(false);
        })
        .catch(() => {
          if (!controller.signal.aborted) setError(true);
        });
    }, PREVIEW_DELAY_MS);

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [definitions, forms, origins, alternatives]);

  return (
    <section className={style.panel} aria-label="Kvaliteta podataka">
      <button
        type="button"
        className={style.header}
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        disabled={!breakdown}
      >
        <span className={style.title}>Kvaliteta podataka</span>
        {breakdown ? (
          <>
            <QualityBadge quality={breakdown.score} level={breakdown.level} />
            <span className={style.points}>
              {formatPoints(breakdown.earned)} / {formatPoints(breakdown.possible)} bodova
            </span>
          </>
        ) : (
          <span className={style.points}>
            {error ? 'Ocjena trenutno nije dostupna' : 'Računanje...'}
          </span>
        )}
        {breakdown && (
          <ChevronDown size={16} className={open ? style.chevronOpen : style.chevron} />
        )}
      </button>

      {open && breakdown && (
        <div className={style.body}>
          {breakdown.untyped && (
            <p className={style.hint}>
              Nijedno značenje nema vrstu riječi, pa se riječ ocjenjuje od{' '}
              {formatPoints(breakdown.possible)} bodova.
            </p>
          )}
          <ul className={style.rules}>
            {breakdown.rules.map((rule) => (
              <li key={rule.key} className={style.rule}>
                <RuleIcon rule={rule} />
                <span className={style.ruleLabel}>
                  {rule.label}
                  {rule.word_type && <span className={style.ruleType}>{rule.word_type}</span>}
                </span>
                <span className={style.ruleCount}>
                  {rule.passed}/{rule.total}
                  {rule.not_applicable > 0 && ` (${rule.not_applicable} n/a)`}
                </span>
                <span className={style.rulePoints}>
                  {formatPoints(rule.earned)} / {formatPoints(rule.points)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
};

export default QualityPanel;
