'use client';

import React, { useState, useEffect } from 'react';
import WordCard from './components/WordCard';
import { Search } from 'lucide-react';
import { Word } from '@/app/api/dictionary/route';
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
        // Fetch one extra to check if there are more pages
        return fetch(
          `/api/dictionary?pageNumber=${currentPage - 1}&pageSize=${ITEMS_PER_PAGE + 1}&word=${searchTerm}`
        );
      })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then((data) => {
        if (ignore) return;
        if (data.length > ITEMS_PER_PAGE) {
          setHasMore(true);
          setWords(data.slice(0, ITEMS_PER_PAGE));
        } else {
          setHasMore(false);
          setWords(data || []);
        }
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
          <p style={{ color: 'red' }}>{error}</p>
        ) : words.length > 0 ? (
          <>
            <div className={style.wordsList}>
              {words.map((word) => (
                <WordCard key={word.id} word={word} />
              ))}
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
