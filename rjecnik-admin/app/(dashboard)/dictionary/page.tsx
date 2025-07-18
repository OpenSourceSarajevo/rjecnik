"use client";

import React, { useState, useEffect, useCallback } from 'react';
import WordCard from './components/WordCard';
import { Search } from 'lucide-react';
import { Word } from "@/app/api/dictionary/route"
import style from './page.module.css';
import Link from "next/link";

const ITEMS_PER_PAGE = 10;

const Page: React.FC = () => {
  const [words, setWords] = useState<Word[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const fetchWords = useCallback(async (page: number, search: string) => {
    setIsLoading(true);
    setError(null);
    try {
      // Fetch one extra to check if there are more pages
      const response = await fetch(`/api/dictionary?pageNumber=${page - 1}&pageSize=${ITEMS_PER_PAGE + 1}&word=${search}`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      
      if (data.length > ITEMS_PER_PAGE) {
        setHasMore(true);
        setWords(data.slice(0, ITEMS_PER_PAGE));
      } else {
        setHasMore(false);
        setWords(data || []);
      }
    } catch (err) {
      setError('Greška pri učitavanju riječi.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWords(currentPage, searchTerm);
  }, [currentPage, searchTerm, fetchWords]);


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
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
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
              {words.map(word => (
                <WordCard key={word.id} word={word} />
              ))}
            </div>
            
              <div className={style.pagination}>
                <div className={style.paginationInfo}>
                  Stranica {currentPage}
                </div>
                <div className={style.paginationControls}>
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className={`${style.paginationButton} ${currentPage === 1 ? style.disabled : ''}`}
                  >
                    Prethodna
                  </button>
                  
                  <button
                    onClick={() => setCurrentPage(p => p + 1)}
                    disabled={!hasMore}
                    className={`${style.paginationButton} ${!hasMore ? style.disabled : ''}`}
                  >
                    Sljedeća
                  </button>
                </div>
              </div>
          </>
        ) : (
          <div className={style.emptyState}>
            <p className={style.emptyStateText}>Nema riječi koje odgovaraju vašim kriterijima.</p>
            <button
              onClick={() => setSearchTerm('')}
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
