'use client';

import React, { useState, useEffect } from 'react';
import { Edit, Search } from 'lucide-react';
import type { QualityLevel, QualityWord } from '@rjecnik/api';
import { api } from '@/utils/api';
import QualityBadge, { LEVEL_LABELS } from '../components/QualityBadge';
import style from './page.module.css';
import Link from 'next/link';
import Button from '@/app/components/Button';

const ITEMS_PER_PAGE = 10;

const Page: React.FC = () => {
  const [words, setWords] = useState<QualityWord[]>([]);
  const [level, setLevel] = useState<QualityLevel | ''>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setSearchTerm(inputValue);
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(timeout);
  }, [inputValue]);

  useEffect(() => {
    let ignore = false;

    Promise.resolve()
      .then(async () => {
        setIsLoading(true);
        setError(null);

        // A quality filter lists the weakest words first; otherwise the fuzzy search order is kept
        if (level) {
          const data = await api.quality.words({
            level,
            q: searchTerm,
            page: currentPage,
            page_size: ITEMS_PER_PAGE,
          });
          return { items: data.items, hasMore: currentPage * ITEMS_PER_PAGE < data.total };
        }

        const data = await api.words.search({
          q: searchTerm,
          page: currentPage,
          page_size: ITEMS_PER_PAGE,
        });
        const scores = data.items.length
          ? await api.quality.scores(data.items.map((w) => w.id))
          : [];
        const byId = new Map(scores.map((s) => [s.id, s]));
        const items = data.items.map((w) => ({
          ...w,
          quality: byId.get(w.id)?.quality ?? null,
          level: byId.get(w.id)?.level ?? null,
        }));
        return { items, hasMore: data.has_more };
      })
      .then(({ items, hasMore }) => {
        if (ignore) return;
        setHasMore(hasMore);
        setWords(items);
      })
      .catch(() => {
        if (!ignore) setError('Greška pri učitavanju riječi.');
      })
      .finally(() => {
        if (!ignore) setIsLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [currentPage, searchTerm, level]);

  return (
    <div className={style.container}>
      <div className={style.headerRow}>
        <Link href="/dictionary/add" className={style.addButton}>
          Dodaj novu riječ
        </Link>
      </div>
      <div className={style.searchAndFilters}>
        <div className={style.searchRow}>
          <div className={style.searchContainer}>
            <div className={style.searchIcon}>
              <Search />
            </div>
            <input
              type="text"
              placeholder="Pretraži riječi..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className={style.searchInput}
            />
          </div>
          <select
            className={style.qualitySelect}
            value={level}
            onChange={(e) => {
              setLevel(e.target.value as QualityLevel | '');
              setCurrentPage(1);
            }}
            aria-label="Kvaliteta podataka"
          >
            <option value="">Sva kvaliteta</option>
            {(Object.keys(LEVEL_LABELS) as QualityLevel[]).map((l) => (
              <option key={l} value={l}>
                {LEVEL_LABELS[l]}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div>
        {isLoading ? (
          <p>Učitavanje riječi...</p>
        ) : error ? (
          <p className={style.errorText}>{error}</p>
        ) : words.length > 0 ? (
          <>
            <div className={style.tableContainer}>
              <table className={style.table}>
                <colgroup>
                  <col className={style.colHeadword} />
                  <col className={style.colType} />
                  <col />
                  <col className={style.colCount} />
                  <col className={style.colQuality} />
                  <col className={style.colActions} />
                </colgroup>
                <thead>
                  <tr>
                    <th>Riječ</th>
                    <th>Vrsta</th>
                    <th>Značenje</th>
                    <th>Značenja</th>
                    <th>Kvaliteta</th>
                    <th>
                      <span className={style.srOnly}>Akcije</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {words.map((word) => {
                    const [first] = word.definitions;
                    return (
                      <tr key={word.id} className={style.tableRow}>
                        <td className={style.headwordCell}>
                          <Link href={`/dictionary/${word.id}`}>{word.headword}</Link>
                        </td>
                        <td>{first?.type || <span className={style.emptyValue}>—</span>}</td>
                        <td className={style.definitionCell}>
                          {first?.definition || <span className={style.emptyValue}>—</span>}
                        </td>
                        <td>{word.definitions.length}</td>
                        <td>
                          <QualityBadge quality={word.quality} level={word.level} />
                        </td>
                        <td className={style.actionsCell}>
                          <Link
                            href={`/dictionary/${word.id}`}
                            className={style.actionButton}
                            title="Uredi riječ"
                            aria-label={`Uredi riječ ${word.headword}`}
                          >
                            <Edit size={18} />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className={style.pagination}>
              <div className={style.paginationInfo}>Stranica {currentPage}</div>
              <div className={style.paginationControls}>
                <Button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  Prethodna
                </Button>

                <Button onClick={() => setCurrentPage((p) => p + 1)} disabled={!hasMore}>
                  Sljedeća
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className={style.emptyState}>
            <p className={style.emptyStateText}>Nema riječi koje odgovaraju vašim kriterijima.</p>
            <button
              onClick={() => {
                setInputValue('');
                setSearchTerm('');
                setLevel('');
                setCurrentPage(1);
              }}
              className={style.emptyStateButton}
            >
              Očisti pretragu
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Page;
