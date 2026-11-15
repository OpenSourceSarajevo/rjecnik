'use client';

import React, { useState, useEffect } from 'react';
import { Edit, Search } from 'lucide-react';
import { Word } from '@/types/dictionary';
import { apiFetch } from '@/utils/api';
import style from './page.module.css';
import Link from 'next/link';
import Button from '@/app/components/Button';

const ITEMS_PER_PAGE = 10;

const Page: React.FC = () => {
  const [words, setWords] = useState<Word[]>([]);
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
      .then(() => {
        setIsLoading(true);
        setError(null);
        const params = new URLSearchParams({
          q: searchTerm,
          page: String(currentPage),
          page_size: String(ITEMS_PER_PAGE),
        });
        return apiFetch<{ items: Word[]; has_more: boolean }>(`/api/words/search?${params}`);
      })
      .then((data) => {
        if (ignore) return;
        setHasMore(data.has_more);
        setWords(data.items);
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
  }, [currentPage, searchTerm]);

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
                  <col className={style.colActions} />
                </colgroup>
                <thead>
                  <tr>
                    <th>Riječ</th>
                    <th>Vrsta</th>
                    <th>Značenje</th>
                    <th>Značenja</th>
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
