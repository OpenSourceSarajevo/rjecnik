'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Book, FileText, Layers, Upload, Database, ArrowRight } from 'lucide-react';

import TypeBreakdown from './components/TypeBreakdown';
import style from './page.module.css';

type Stats = {
  words: number;
  definitions: number;
  forms: number;
};

type TypeBreakdownItem = {
  type: string;
  count: number;
};

const quickActions = [
  {
    href: '/rjecnik',
    icon: Book,
    title: 'Rječnik',
    description: 'Pretraži i uredi postojeće riječi',
  },
  {
    href: '/ucitaj-tekst',
    icon: Upload,
    title: 'Učitaj tekst',
    description: 'Dodaj novi tekst za obradu',
  },
  {
    href: '/obradi-rijeci',
    icon: Database,
    title: 'Obradi riječi',
    description: 'Pregledaj i obradi nove riječi',
  },
];

const statCards = [
  { key: 'words' as const, icon: Book, label: 'Riječi' },
  { key: 'definitions' as const, icon: FileText, label: 'Definicije' },
  { key: 'forms' as const, icon: Layers, label: 'Oblici' },
];

function StatSkeleton() {
  return (
    <div className={style.statsContainer}>
      {statCards.map(({ key }) => (
        <div key={key} className={`${style.statBlock} ${style.skeleton}`} />
      ))}
    </div>
  );
}

export default function Page() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [typeBreakdown, setTypeBreakdown] = useState<TypeBreakdownItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStats() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/dashboard');
        if (!res.ok) throw new Error('Greška pri učitavanju statistike.');
        const data = await res.json();
        setStats(data.stats);
        setTypeBreakdown(data.type_breakdown);
      } catch {
        setError('Greška pri učitavanju statistike.');
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  return (
    <div>
      <div className={style.header}>
        <h1 className={style.title}>Kontrolna tabla</h1>
        <p className={style.subtitle}>Pregled stanja rječnika i brze radnje</p>
      </div>

      <div className={style.quickActions}>
        {quickActions.map(({ href, icon: Icon, title, description }) => (
          <Link key={href} href={href} className={style.quickAction}>
            <div className={style.quickActionIcon}>
              <Icon size={20} />
            </div>
            <div className={style.quickActionText}>
              <div className={style.quickActionTitle}>{title}</div>
              <div className={style.quickActionDescription}>{description}</div>
            </div>
            <ArrowRight size={18} className={style.quickActionArrow} />
          </Link>
        ))}
      </div>

      {error ? (
        <p className={style.error}>{error}</p>
      ) : loading || !stats ? (
        <StatSkeleton />
      ) : (
        <>
          <div className={style.statsContainer}>
            {statCards.map(({ key, icon: Icon, label }) => (
              <div key={key} className={style.statBlock}>
                <div className={style.statIcon}>
                  <Icon size={20} />
                </div>
                <div>
                  <div className={style.statLabel}>{label}</div>
                  <div className={style.statValue}>{stats[key].toLocaleString('bs-BA')}</div>
                </div>
              </div>
            ))}
          </div>

          <TypeBreakdown items={typeBreakdown} />
        </>
      )}
    </div>
  );
}
