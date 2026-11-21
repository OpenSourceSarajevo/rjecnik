'use client';

import React, { useEffect, useState } from 'react';
import { Activity as ActivityIcon, CalendarDays, FilePlus, PencilLine } from 'lucide-react';
import type { Activity } from '@rjecnik/api';
import { api } from '@/utils/api';
import style from './ActivityStats.module.css';

type RangeKey = '24h' | '7d' | '30d' | 'custom';

const RANGES: { key: RangeKey; label: string }[] = [
  { key: '24h', label: '24 sata' },
  { key: '7d', label: '7 dana' },
  { key: '30d', label: '30 dana' },
  { key: 'custom', label: 'Prilagođeno' },
];

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

/** A `yyyy-mm-dd` date input value as local midnight. */
const startOfDay = (value: string) => {
  const [y, m, d] = value.split('-').map(Number);
  return new Date(y, m - 1, d);
};

const toInputValue = (date: Date) => {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

/** [start, end) for a range; a custom range includes its last day. */
const toPeriod = (range: RangeKey, from: string, to: string): [Date, Date] => {
  if (range === 'custom') {
    const end = startOfDay(to);
    end.setDate(end.getDate() + 1);
    return [startOfDay(from), end];
  }
  const end = new Date();
  const length = { '24h': 24 * HOUR, '7d': 7 * DAY, '30d': 30 * DAY }[range];
  return [new Date(end.getTime() - length), end];
};

const formatNumber = (n: number, fractionDigits = 0) =>
  n.toLocaleString('bs-BA', {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  });

/** Words created and edited in a chosen period (issue #105). */
const ActivityStats: React.FC = () => {
  // Read the clock once, when the component mounts; the custom range defaults to the last 7 days
  const [today] = useState(() => toInputValue(new Date()));
  const [weekAgo] = useState(() => toInputValue(new Date(Date.now() - 6 * DAY)));
  const [range, setRange] = useState<RangeKey>('24h');
  const [from, setFrom] = useState(weekAgo);
  const [to, setTo] = useState(today);
  // The custom dates only take effect when applied, not while typing
  const [applied, setApplied] = useState({ from, to });
  const [activity, setActivity] = useState<Activity | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let ignore = false;
    const [start, end] = toPeriod(range, applied.from, applied.to);

    Promise.resolve()
      .then(() => {
        setLoading(true);
        setError(false);
        return api.dashboard.activity({ start: start.toISOString(), end: end.toISOString() });
      })
      .then((data) => {
        if (!ignore) setActivity(data);
      })
      .catch(() => {
        if (!ignore) setError(true);
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [range, applied]);

  const customInvalid = !from || !to || from > to;

  const cards = activity
    ? [
        { icon: FilePlus, label: 'Nove riječi', value: formatNumber(activity.new_words) },
        {
          icon: PencilLine,
          label: 'Izmijenjene riječi',
          value: formatNumber(activity.edited_words),
        },
        {
          icon: ActivityIcon,
          label: 'Ukupno izmjena',
          value: formatNumber(activity.total_changes),
        },
        {
          icon: CalendarDays,
          label: 'Prosjek dnevno',
          value: formatNumber(activity.average_daily_changes, 1),
        },
      ]
    : [];

  return (
    <div>
      <div className={style.header}>
        <h2 className={style.subTitle}>Aktivnost</h2>
        <div className={style.tabs} role="tablist" aria-label="Period aktivnosti">
          {RANGES.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={range === key}
              className={`${style.tab} ${range === key ? style.tabActive : ''}`}
              onClick={() => setRange(key)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {range === 'custom' && (
        <form
          className={style.customRange}
          onSubmit={(e) => {
            e.preventDefault();
            if (!customInvalid) setApplied({ from, to });
          }}
        >
          <label className={style.dateField}>
            <span>Od</span>
            <input
              type="date"
              className={style.dateInput}
              value={from}
              max={to || today}
              onChange={(e) => setFrom(e.target.value)}
            />
          </label>
          <label className={style.dateField}>
            <span>Do</span>
            <input
              type="date"
              className={style.dateInput}
              value={to}
              min={from}
              max={today}
              onChange={(e) => setTo(e.target.value)}
            />
          </label>
          <button type="submit" className={style.applyButton} disabled={customInvalid}>
            Primijeni
          </button>
        </form>
      )}

      {error ? (
        <p className={style.error}>Greška pri učitavanju aktivnosti.</p>
      ) : (
        <div className={style.cards} aria-busy={loading}>
          {loading || !activity
            ? Array.from({ length: 4 }, (_, i) => (
                <div key={i} className={`${style.card} ${style.skeleton}`} />
              ))
            : cards.map(({ icon: Icon, label, value }) => (
                <div key={label} className={style.card}>
                  <div className={style.cardIcon}>
                    <Icon size={18} />
                  </div>
                  <div>
                    <div className={style.cardLabel}>{label}</div>
                    <div className={style.cardValue}>{value}</div>
                  </div>
                </div>
              ))}
        </div>
      )}
    </div>
  );
};

export default ActivityStats;
