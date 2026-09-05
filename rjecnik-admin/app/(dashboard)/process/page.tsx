'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';
import { ArrowLeft, ArrowRight, Wand2, Inbox, Search, X } from 'lucide-react';
import ToastContainer, { Toast } from '@/app/components/Toast';
import { NewWord, WordProcessingStrategy } from '@/app/api/words/contracts';
import style from './page.module.css';
import Button from '@/app/components/Button';

const ITEMS_PER_PAGE = 14;
const NEW_FILTER_OPTIONS = [
  { value: '', label: 'Sve' },
  { value: 'true', label: 'Da' },
  { value: 'false', label: 'Ne' },
] as const;

export default function Page() {
  const [words, setWords] = useState<NewWord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [totalCount, setTotalCount] = useState<number | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [expandedExamples, setExpandedExamples] = useState<Set<number>>(new Set());
  const [headwordInput, setHeadwordInput] = useState('');
  const [headwordFilter, setHeadwordFilter] = useState('');
  const [strategyFilter, setStrategyFilter] = useState('');
  const [isNewFilter, setIsNewFilter] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [bulkStrategy, setBulkStrategy] = useState('');
  const [isBulkApplying, setIsBulkApplying] = useState(false);
  const router = useRouter();

  const hasActiveFilters = Boolean(headwordFilter || strategyFilter || isNewFilter);

  const clearFilters = () => {
    setHeadwordInput('');
    setHeadwordFilter('');
    setStrategyFilter('');
    setIsNewFilter('');
  };

  useEffect(() => {
    const handle = setTimeout(() => {
      setHeadwordFilter(headwordInput.trim());
    }, 300);
    return () => clearTimeout(handle);
  }, [headwordInput]);

  useEffect(() => {
    setCurrentPage(1);
  }, [headwordFilter, strategyFilter, isNewFilter]);

  const toggleExamples = (id: number) => {
    setExpandedExamples((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const strategyTranslations: Record<WordProcessingStrategy, string> = {
    'Frequency Only': 'Samo frekvencija',
    // "New Example": "Novi primjer",
    'New Definition': 'Nova definicija',
    'New Form': 'Novi oblik',
    'Existing Form': 'Postojeći oblik',
    'New Headword': 'Nova riječ',
    Ignore: 'Ignoriši',
    Remove: 'Ukloni',
  };

  const strategies: WordProcessingStrategy[] = [
    'Frequency Only',
    // "New Example",
    'New Definition',
    'New Form',
    'Existing Form',
    'New Headword',
    'Ignore',
    'Remove',
  ];

  useEffect(() => {
    let ignore = false;

    Promise.resolve()
      .then(() => {
        setIsLoading(true);
        setError(null);
        const params = new URLSearchParams({
          pageNumber: String(currentPage - 1),
          pageSize: String(ITEMS_PER_PAGE),
        });
        if (headwordFilter) params.set('headword', headwordFilter);
        if (strategyFilter) params.set('strategy', strategyFilter);
        if (isNewFilter) params.set('isNew', isNewFilter);
        return fetch(`/api/words/new?${params.toString()}`);
      })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(({ data, total }) => {
        if (ignore) return;
        setTotalCount(total);
        setHasMore(total > currentPage * ITEMS_PER_PAGE);
        setWords(data || []);
        setExpandedExamples(new Set());
        setSelectedIds(new Set());
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
  }, [currentPage, headwordFilter, strategyFilter, isNewFilter]);

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

  const toggleSelected = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleSelectAll = () => {
    setSelectedIds((prev) =>
      prev.size === words.length ? new Set() : new Set(words.map((w) => w.id))
    );
  };

  const clearSelection = () => setSelectedIds(new Set());

  const handleBulkStrategyApply = async () => {
    if (!bulkStrategy || selectedIds.size === 0) return;

    setIsBulkApplying(true);
    const ids = Array.from(selectedIds);
    const results = await Promise.allSettled(
      ids.map((id) =>
        fetch(`/api/words/new/${id}/strategy/${encodeURIComponent(bulkStrategy)}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
        }).then(async (res) => {
          const data = await res.json();
          if (!res.ok || data.error) {
            throw new Error(data.error ? String(data.error) : `Greška: ${res.status}`);
          }
          return data as NewWord;
        })
      )
    );

    const updatedById = new Map<number, NewWord>();
    let failedCount = 0;
    results.forEach((result) => {
      if (result.status === 'fulfilled') {
        updatedById.set(result.value.id, result.value);
      } else {
        failedCount += 1;
      }
    });

    setWords((prevWords) =>
      prevWords.map((word) => {
        const updated = updatedById.get(word.id);
        return updated
          ? { ...word, strategy: updated.strategy, assigned_to: updated.assigned_to }
          : word;
      })
    );

    if (updatedById.size > 0) {
      setToasts((prev) => [
        ...prev,
        {
          id: uuidv4(),
          type: 'success',
          message: `Strategija dodijeljena za ${updatedById.size} riječi.`,
        },
      ]);
    }
    if (failedCount > 0) {
      setToasts((prev) => [
        ...prev,
        {
          id: uuidv4(),
          type: 'error',
          message: `Neuspješno za ${failedCount} riječi.`,
        },
      ]);
    }

    setSelectedIds(new Set());
    setBulkStrategy('');
    setIsBulkApplying(false);
  };

  return (
    <>
      <ToastContainer toasts={toasts} onRemove={handleRemoveToast} />

      <div className={style.header}>
        <div>
          <h1 className={style.title}>Obradi riječi</h1>
          <p className={style.subtitle}>Pregledaj nove riječi i dodijeli im strategiju obrade</p>
        </div>
        <Button onClick={() => router.push('/process/flow')} className={style.navButton}>
          <Wand2 size={16} />
          Obradi riječi
        </Button>
      </div>

      <div className={style.filters}>
        <div className={style.searchField}>
          <Search size={16} className={style.searchIcon} />
          <input
            type="text"
            placeholder="Pretraži riječ..."
            value={headwordInput}
            onChange={(e) => setHeadwordInput(e.target.value)}
            className={style.searchInput}
          />
        </div>

        <select
          className={style.filterSelect}
          value={strategyFilter}
          onChange={(e) => setStrategyFilter(e.target.value)}
        >
          <option value="">Sve strategije</option>
          <option value="none">Bez strategije</option>
          {strategies.map((s) => (
            <option key={s} value={s}>
              {strategyTranslations[s]}
            </option>
          ))}
        </select>

        <select
          className={style.filterSelect}
          value={isNewFilter}
          onChange={(e) => setIsNewFilter(e.target.value)}
        >
          {NEW_FILTER_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.value === '' ? 'Nova: sve' : `Nova: ${opt.label}`}
            </option>
          ))}
        </select>

        {hasActiveFilters && (
          <button type="button" className={style.clearFilters} onClick={clearFilters}>
            <X size={14} />
            Očisti filtere
          </button>
        )}
      </div>

      {selectedIds.size > 0 && (
        <div className={style.bulkBar}>
          <span className={style.bulkCount}>Odabrano: {selectedIds.size}</span>
          <select
            className={style.filterSelect}
            value={bulkStrategy}
            onChange={(e) => setBulkStrategy(e.target.value)}
          >
            <option value="">Odaberi strategiju...</option>
            {strategies.map((s) => (
              <option key={s} value={s}>
                {strategyTranslations[s]}
              </option>
            ))}
          </select>
          <Button
            onClick={handleBulkStrategyApply}
            disabled={!bulkStrategy || isBulkApplying}
            className={style.navButton}
          >
            {isBulkApplying ? 'Primjenjuje se...' : 'Primijeni'}
          </Button>
          <button type="button" className={style.clearFilters} onClick={clearSelection}>
            <X size={14} />
            Poništi odabir
          </button>
        </div>
      )}

      {totalCount !== null && !isLoading && !error && (
        <div className={style.totalCount}>Ukupno: {totalCount}</div>
      )}

      {error ? (
        <div className={style.stateCard}>
          <p className={style.errorText}>{error}</p>
        </div>
      ) : isLoading ? (
        <div className={style.container}>
          <div className={style.skeletonTable}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className={`${style.skeletonRow} ${style.skeleton}`} />
            ))}
          </div>
        </div>
      ) : words.length === 0 ? (
        <div className={style.stateCard}>
          <Inbox size={28} />
          <p>
            {hasActiveFilters
              ? 'Nema riječi koje odgovaraju filterima.'
              : 'Nema novih riječi za obradu.'}
          </p>
          {hasActiveFilters && (
            <Button onClick={clearFilters} className={style.navButton}>
              Očisti filtere
            </Button>
          )}
        </div>
      ) : (
        <div className={style.container}>
          <div className={style.tableScroll}>
            <table className={style.table}>
              <colgroup>
                <col className={style.colSelect} />
                <col className={style.colHeadword} />
                <col className={style.colExamples} />
                <col className={style.colCount} />
                <col className={style.colIsNew} />
                <col className={style.colCreatedBy} />
                <col className={style.colStrategy} />
                <col className={style.colAssignedTo} />
              </colgroup>
              <thead>
                <tr>
                  <th>
                    <input
                      type="checkbox"
                      className={style.checkbox}
                      checked={words.length > 0 && selectedIds.size === words.length}
                      onChange={toggleSelectAll}
                      aria-label="Odaberi sve"
                    />
                  </th>
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
                {words.map((word) => {
                  const isExpanded = expandedExamples.has(word.id);
                  const hasExtraExamples = word.examples.length > 1;
                  const visibleExamples = isExpanded ? word.examples : word.examples.slice(0, 1);

                  return (
                    <tr
                      key={word.id}
                      className={`${style.tableRow} ${selectedIds.has(word.id) ? style.tableRowSelected : ''}`}
                    >
                      <td>
                        <input
                          type="checkbox"
                          className={style.checkbox}
                          checked={selectedIds.has(word.id)}
                          onChange={() => toggleSelected(word.id)}
                          aria-label={`Odaberi ${word.headword}`}
                        />
                      </td>
                      <td className={style.headwordCell}>{word.headword}</td>
                      <td>
                        <ul className={style.examplesList}>
                          {visibleExamples.map((ex, idx) => (
                            <li key={idx}>{ex}</li>
                          ))}
                        </ul>
                        {hasExtraExamples && (
                          <button
                            type="button"
                            className={style.examplesToggle}
                            onClick={() => toggleExamples(word.id)}
                          >
                            {isExpanded ? 'Prikaži manje' : `+${word.examples.length - 1} više`}
                          </button>
                        )}
                      </td>
                      <td>{word.count}</td>
                      <td>
                        <span
                          className={`${style.badge} ${word.is_new ? style.badgeNew : style.badgeMuted}`}
                        >
                          {word.is_new ? 'Da' : 'Ne'}
                        </span>
                      </td>
                      <td>{word.created_by || <span className={style.emptyValue}>—</span>}</td>
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
                      <td>{word.assigned_to || <span className={style.emptyValue}>—</span>}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!isLoading && !error && words.length > 0 && (
        <div className={style.pagination}>
          <div className={style.paginationInfo}>Stranica {currentPage}</div>
          <div className={style.paginationControls}>
            <Button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className={style.navButton}
            >
              <ArrowLeft size={16} />
              Prethodna
            </Button>
            <Button
              onClick={() => setCurrentPage((p) => p + 1)}
              disabled={!hasMore}
              className={style.navButton}
            >
              Sljedeća
              <ArrowRight size={16} />
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
