'use client';
import React, { useMemo, useState } from 'react';
import { BarChart3, PieChart as PieChartIcon, Table } from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
} from 'recharts';

import style from './TypeBreakdown.module.css';

type TypeBreakdownItem = {
  type: string;
  count: number;
};

type ViewMode = 'bar' | 'share' | 'table';

const VIEWS: { key: ViewMode; label: string; icon: typeof BarChart3 }[] = [
  { key: 'bar', label: 'Traka', icon: BarChart3 },
  { key: 'share', label: 'Udio', icon: PieChartIcon },
  { key: 'table', label: 'Tabela', icon: Table },
];

// Validated 8-hue categorical order (references/palette.md) — fixed order, never cycled.
const CATEGORICAL_COLORS = [
  '#2a78d6',
  '#eb6834',
  '#1baf7a',
  '#eda100',
  '#e87ba4',
  '#008300',
  '#4a3aa7',
];
const BAR_COLOR = '#3b82f6';

const formatPercent = (value: number) =>
  `${value.toLocaleString('bs-BA', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`;

function buildSegments(sorted: TypeBreakdownItem[]) {
  return sorted.map((item, index) => ({
    ...item,
    fill: CATEGORICAL_COLORS[index % CATEGORICAL_COLORS.length],
  }));
}

function BarTooltip({ active, payload }: { active?: boolean; payload?: { value: number; payload: TypeBreakdownItem }[] }) {
  if (!active || !payload?.length) return null;
  const { type, count } = payload[0].payload;
  return (
    <div className={style.tooltip}>
      <strong>{count.toLocaleString('bs-BA')}</strong>
      <span>{type}</span>
    </div>
  );
}

function ShareTooltip({
  active,
  payload,
  total,
}: {
  active?: boolean;
  payload?: { payload: { type: string; count: number } }[];
  total: number;
}) {
  if (!active || !payload?.length) return null;
  const { type, count } = payload[0].payload;
  return (
    <div className={style.tooltip}>
      <strong>{count.toLocaleString('bs-BA')}</strong>
      <span>
        {type} · {formatPercent((count / total) * 100)}
      </span>
    </div>
  );
}

export default function TypeBreakdown({ items }: { items: TypeBreakdownItem[] }) {
  const [view, setView] = useState<ViewMode>('bar');

  const sorted = useMemo(() => [...items].sort((a, b) => b.count - a.count), [items]);
  const total = useMemo(() => sorted.reduce((sum, item) => sum + item.count, 0), [sorted]);
  const donutSegments = useMemo(() => buildSegments(sorted), [sorted]);

  if (items.length === 0) {
    return null;
  }

  return (
    <div>
      <div className={style.header}>
        <h2 className={style.subTitle}>Raspodjela tipova</h2>
        <div className={style.tabs} role="tablist" aria-label="Prikaz raspodjele tipova">
          {VIEWS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={view === key}
              className={`${style.tab} ${view === key ? style.tabActive : ''}`}
              onClick={() => setView(key)}
            >
              <Icon size={14} />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>

      {view === 'bar' && (
        <div className={style.chartCard} style={{ height: Math.max(sorted.length * 36, 120) }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={sorted} layout="vertical" margin={{ top: 4, right: 24, bottom: 4, left: 4 }}>
              <CartesianGrid horizontal={false} stroke="var(--color-gray-100)" />
              <XAxis type="number" hide />
              <YAxis
                type="category"
                dataKey="type"
                width={110}
                tickLine={false}
                axisLine={false}
                tick={{ fill: 'var(--color-gray-700)', fontSize: 13 }}
              />
              <Tooltip content={<BarTooltip />} cursor={{ fill: 'var(--color-gray-50)' }} />
              <Bar dataKey="count" fill={BAR_COLOR} radius={[0, 4, 4, 0]} barSize={16} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {view === 'share' && (
        <div className={style.chartCard}>
          <div className={style.donutRow}>
            <div className={style.donutWrap}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={donutSegments}
                    dataKey="count"
                    nameKey="type"
                    outerRadius="92%"
                    stroke="var(--color-white)"
                    strokeWidth={2}
                  />
                  <Tooltip content={<ShareTooltip total={total} />} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <ul className={style.legend}>
              {donutSegments.map(({ type, count, fill }) => (
                <li key={type} className={style.legendItem}>
                  <span className={style.legendSwatch} style={{ background: fill }} />
                  <span className={style.legendLabel}>{type}</span>
                  <span className={style.legendValue}>{formatPercent((count / total) * 100)}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {view === 'table' && (
        <div className={style.tableWrap}>
          <table className={style.table}>
            <thead>
              <tr>
                <th>Tip</th>
                <th>Broj</th>
                <th>Udio</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map(({ type, count }) => (
                <tr key={type}>
                  <td>{type}</td>
                  <td className={style.numericCell}>{count.toLocaleString('bs-BA')}</td>
                  <td className={style.numericCell}>{formatPercent((count / total) * 100)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
