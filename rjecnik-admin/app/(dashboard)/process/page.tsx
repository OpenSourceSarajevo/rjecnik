'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';
import ToastContainer, { Toast } from '@/app/components/Toast';
import { NewWord, WordProcessingStrategy } from '@/app/api/words/contracts';
import style from './page.module.css';

const ITEMS_PER_PAGE = 14;

export default function Page() {
  const [words, setWords] = useState<NewWord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const router = useRouter();

  const strategyTranslations: Record<WordProcessingStrategy, string> = {
    'Frequency Only': 'Samo frekvencija',
    // "New Example": "Novi primjer",
    // "New Definition": "Nova definicija",
    'New Form': 'Novi oblik',
    'Existing Form': 'Postojeći oblik',
    // "New Headword": "Nova riječ",
    // Ignore: "Ignoriši",
    Remove: 'Ukloni',
  };

  const strategies: WordProcessingStrategy[] = [
    'Frequency Only',
    // "New Example",
    // "New Definition",
    'New Form',
    'Existing Form',
    // "New Headword",
    // "Ignore",
    'Remove',
  ];

  const fetchWords = useCallback(async (page: number) => {
    setIsLoading(true);
    setError(null);
    try {
      // Fetch one extra to check if there are more pages
      const response = await fetch(
        `/api/words/new?pageNumber=${page - 1}&pageSize=${ITEMS_PER_PAGE + 1}`
      );
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
    } catch {
      setError('Greška pri učitavanju riječi.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWords(currentPage);
  }, [currentPage, fetchWords]);

  const handleStrategyChange = async (id: number, strategy: WordProcessingStrategy) => {
    const res = await fetch(`/api/words/new/${id}/strategy/${encodeURIComponent(strategy)}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
    });
    const data = await res.json();
    if (!res.ok || data.error) {
      setToasts((prev) => [
        ...prev,
        {
          id: uuidv4(),
          type: 'error',
          message: data.error ? String(data.error) : `Greška: ${res.status}`,
        },
      ]);
      return;
    }

    const updatedWord = data as NewWord;
    setWords((prevWords) =>
      prevWords.map((word) =>
        word.id === updatedWord.id
          ? { ...word, strategy: updatedWord.strategy, assigned_to: updatedWord.assigned_to }
          : word
      )
    );
  };

  const handleRemoveToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  if (isLoading) {
    return <p>Učitavanje riječi...</p>;
  }

  if (error) {
    return <p style={{ color: 'red' }}>{error}</p>;
  }

  return (
    <>
      <ToastContainer toasts={toasts} onRemove={handleRemoveToast} />

      <button className={style.processingButton} onClick={() => router.push('/process/flow')}>
        Obradi riječi
      </button>

      <div className={style.container}>
        <table className={style.table}>
          <thead>
            <tr>
              <th>Riječ</th>
              <th>Primjeri</th>
              <th>Pojavljivanja</th>
              <th>Nova</th>
              <th>Kreirao/la</th>
              <th>Strategija</th>
              <th>Dodijeljena</th>
            </tr>
          </thead>
          <tbody>
            {words.map((word) => (
              <tr key={word.id} className={style.tableRow}>
                <td>{word.headword}</td>
                <td>
                  <div className={style.examplesCell}>
                    <ul className={style.examplesList}>
                      {word.examples.map((ex, idx) => (
                        <li key={idx}>{ex}</li>
                      ))}
                    </ul>
                  </div>
                </td>
                <td>{word.count}</td>
                <td>{word.is_new ? 'Da' : 'Ne'}</td>
                <td>{word.created_by}</td>
                <td className={style.tableRowCell}>
                  <select
                    className={style.strategySelect}
                    value={(word.strategy as string) || ''}
                    onChange={(e) =>
                      handleStrategyChange(
                        word.id,
                        (e.target.value as WordProcessingStrategy) || null
                      )
                    }
                  >
                    <option value="">Bez strategije</option>
                    {strategies.map((s) => (
                      <option key={s} value={s}>
                        {strategyTranslations[s]}
                      </option>
                    ))}
                  </select>
                </td>
                <td>{word.assigned_to}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className={style.pagination}>
        <div className={style.paginationInfo}>Stranica {currentPage}</div>
        <div className={style.paginationControls}>
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className={`${style.paginationButton} ${currentPage === 1 ? style.disabled : ''}`}
          >
            Prethodna
          </button>
          <button
            onClick={() => setCurrentPage((p) => p + 1)}
            disabled={!hasMore}
            className={`${style.paginationButton} ${!hasMore ? style.disabled : ''}`}
          >
            Sljedeća
          </button>
        </div>
      </div>
    </>
  );
}
