'use client';

import { useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { ArrowLeft, ArrowRight, Search, Inbox, Trash2, Upload, X } from 'lucide-react';
import ToastContainer, { Toast } from '@/app/components/Toast';
import { IgnoredWord, IgnoreType } from '@/app/api/words/contracts';
import style from './page.module.css';
import Button from '@/app/components/Button';

const ITEMS_PER_PAGE = 14;

const ignoreTypeLabels: Record<IgnoreType, string> = {
  ostalo: 'Ostalo',
  ime: 'Vlastito ime',
  strana_riječ: 'Strana riječ',
  skraćenica: 'Skraćenica',
};

const ignoreTypes: IgnoreType[] = ['ostalo', 'ime', 'strana_riječ', 'skraćenica'];

export default function Page() {
  const [words, setWords] = useState<IgnoredWord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [totalCount, setTotalCount] = useState<number | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [importText, setImportText] = useState('');
  const [importType, setImportType] = useState<IgnoreType>('ostalo');
  const [isImporting, setIsImporting] = useState(false);

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
        return fetch(
          `/api/words/ignore?pageNumber=${currentPage - 1}&pageSize=${ITEMS_PER_PAGE}&word=${encodeURIComponent(searchTerm)}`
        );
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
  }, [currentPage, searchTerm, refreshKey]);

  const addToast = (toast: Omit<Toast, 'id'>) => {
    setToasts((prev) => [...prev, { ...toast, id: uuidv4() }]);
  };

  const handleRemoveToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const handleTypeChange = async (id: number, type: IgnoreType) => {
    const res = await fetch(`/api/words/ignore/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type }),
    });
    const data = await res.json();
    if (!res.ok || data.error) {
      addToast({
        type: 'error',
        message: data.error ? String(data.error) : `Greška: ${res.status}`,
      });
      return;
    }
    setWords((prev) => prev.map((w) => (w.id === id ? { ...w, type: data.type } : w)));
  };

  const handleRemove = async (id: number, headword: string) => {
    if (!window.confirm(`Ukloniti "${headword}" sa liste ignorisanih riječi?`)) {
      return;
    }
    const res = await fetch(`/api/words/ignore/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      addToast({
        type: 'error',
        message: data.error ? String(data.error) : `Greška: ${res.status}`,
      });
      return;
    }
    setWords((prev) => prev.filter((w) => w.id !== id));
    setTotalCount((prev) => (prev !== null ? prev - 1 : prev));
    addToast({ type: 'success', message: `"${headword}" je uklonjena sa liste.` });
  };

  const handleImport = async () => {
    const headwords = Array.from(
      new Set(
        importText
          .split(/[\n,]/)
          .map((w) => w.trim())
          .filter(Boolean)
      )
    );

    if (headwords.length === 0) {
      addToast({ type: 'error', message: 'Unesite barem jednu riječ.' });
      return;
    }

    setIsImporting(true);
    try {
      const res = await fetch('/api/words/ignore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ headwords, type: importType }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        addToast({
          type: 'error',
          message: data.error ? String(data.error) : `Greška: ${res.status}`,
        });
        return;
      }
      addToast({
        type: 'success',
        message: `Dodano/ažurirano ${data.count} riječi.`,
      });
      setImportText('');
      setIsImportOpen(false);
      setCurrentPage(1);
      setRefreshKey((k) => k + 1);
    } catch {
      addToast({ type: 'error', message: 'Greška pri uvozu riječi.' });
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <>
      <ToastContainer toasts={toasts} onRemove={handleRemoveToast} />

      <div className={style.header}>
        <div>
          <h1 className={style.title}>Ignorisane riječi</h1>
          <p className={style.subtitle}>Pregledaj i upravljaj riječima označenim za ignorisanje</p>
        </div>
        <Button onClick={() => setIsImportOpen((open) => !open)} className={style.navButton}>
          <Upload size={16} />
          Uvezi riječi
        </Button>
      </div>

      {isImportOpen && (
        <div className={style.importPanel}>
          <div className={style.importHeader}>
            <p className={style.importTitle}>Uvezi riječi</p>
            <button
              className={style.importClose}
              onClick={() => setIsImportOpen(false)}
              title="Zatvori"
            >
              <X size={18} />
            </button>
          </div>
          <p className={style.importHint}>Unesite riječi odvojene novim redom ili zarezom.</p>
          <textarea
            className={style.importTextarea}
            value={importText}
            onChange={(e) => setImportText(e.target.value)}
            placeholder={'npr.\nSarajevo\nokay, itd'}
            rows={6}
          />
          <div className={style.importControls}>
            <select
              className={style.typeSelect}
              value={importType}
              onChange={(e) => setImportType(e.target.value as IgnoreType)}
            >
              {ignoreTypes.map((t) => (
                <option key={t} value={t}>
                  {ignoreTypeLabels[t]}
                </option>
              ))}
            </select>
            <Button onClick={handleImport} disabled={isImporting} className={style.navButton}>
              {isImporting ? 'Uvoženje...' : 'Uvezi'}
            </Button>
          </div>
        </div>
      )}

      <div className={style.searchRow}>
        <div className={style.searchContainer}>
          <div className={style.searchIcon}>
            <Search size={18} />
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
            {searchTerm
              ? 'Nema riječi koje odgovaraju vašoj pretrazi.'
              : 'Nema ignorisanih riječi.'}
          </p>
        </div>
      ) : (
        <div className={style.container}>
          <table className={style.table}>
            <thead>
              <tr>
                <th>Riječ</th>
                <th>Tip</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {words.map((word) => (
                <tr key={word.id} className={style.tableRow}>
                  <td>{word.headword}</td>
                  <td className={style.tableRowCell}>
                    <select
                      className={style.typeSelect}
                      value={word.type}
                      onChange={(e) => handleTypeChange(word.id, e.target.value as IgnoreType)}
                    >
                      {ignoreTypes.map((t) => (
                        <option key={t} value={t}>
                          {ignoreTypeLabels[t]}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <button
                      className={style.removeButton}
                      title="Ukloni sa liste"
                      onClick={() => handleRemove(word.id, word.headword)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
