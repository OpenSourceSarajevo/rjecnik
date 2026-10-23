'use client';

import { useEffect, useRef, useState } from 'react';
import { Search, X } from 'lucide-react';

import Card from '../Card';

import style from './SearchResults.module.css';

type Word = {
  id: number;
  headword: string;
  definitions: Definition[];
};

type Definition = {
  type: string | null;
  gender: string | null;
  definition: string;
};

const PAGE_SIZE = 20;
const DEBOUNCE_MS = 250;

const SearchResults = ({ initialQuery }: { initialQuery: string }) => {
  const [query, setQuery] = useState(initialQuery);
  // Query and page change together so a new query never fetches a stale page
  const [search, setSearch] = useState({ query: initialQuery.trim(), page: 0 });
  const [data, setData] = useState<Word[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timeout = setTimeout(() => {
      const next = query.trim();
      setSearch((prev) => (prev.query === next ? prev : { query: next, page: 0 }));
    }, DEBOUNCE_MS);

    return () => clearTimeout(timeout);
  }, [query]);

  useEffect(() => {
    const url = search.query ? `?q=${encodeURIComponent(search.query)}` : window.location.pathname;
    window.history.replaceState(null, '', url);
  }, [search.query]);

  useEffect(() => {
    const controller = new AbortController();
    const { query, page } = search;

    (async function getData() {
      setLoading(true);
      setError(false);
      if (page === 0) setData([]);

      try {
        const params = new URLSearchParams({
          pageNumber: page.toString(),
          pageSize: PAGE_SIZE.toString(),
          word: query,
        });
        const res = await fetch(`/api/dictionary?${params}`, { signal: controller.signal });
        if (!res.ok) throw new Error(res.statusText);

        const newData: Word[] = await res.json();
        setData((prevData) => [...prevData, ...newData]);
        setHasMore(newData.length === PAGE_SIZE);
        setLoading(false);
      } catch {
        if (controller.signal.aborted) return;
        setError(true);
        setLoading(false);
      }
    })();

    return () => controller.abort();
  }, [search]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || loading || !hasMore || error) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setSearch((prev) => ({ ...prev, page: prev.page + 1 }));
      },
      { rootMargin: '400px' }
    );
    observer.observe(sentinel);

    return () => observer.disconnect();
  }, [loading, hasMore, error]);

  const isEmpty = !loading && !error && data.length === 0;

  return (
    <>
      <div className={style.searchBar} role="search">
        <Search className={style.searchIcon} size={20} aria-hidden="true" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Pretraži riječ…"
          aria-label="Pretraži riječ"
          autoComplete="off"
          autoFocus
          className={style.input}
        />
        {query && (
          <button
            type="button"
            className={style.clear}
            onClick={() => setQuery('')}
            aria-label="Obriši pretragu"
          >
            <X size={18} />
          </button>
        )}
      </div>

      <div className={style.results} aria-live="polite" aria-busy={loading}>
        {data.map((item) => {
          const firstDefinition =
            item.definitions.length > 0 ? item.definitions[0].definition : undefined;

          const definitionsCount = item.definitions.filter(
            (i) => i.definition && i.definition.length > 0
          ).length;

          return (
            <Card
              key={item.id}
              title={item.headword}
              definitionsCount={definitionsCount > 0 ? definitionsCount : undefined}
              firstDefinition={firstDefinition}
            />
          );
        })}

        {loading &&
          Array.from({ length: data.length === 0 ? 6 : 2 }, (_, i) => (
            <div key={i} className={style.skeleton} aria-hidden="true">
              <span className={style.skeletonTitle} />
              <span className={style.skeletonLine} />
            </div>
          ))}

        {isEmpty && (
          <div className={style.message}>
            <p className={style.messageTitle}>Nema rezultata za „{search.query}“</p>
            <p>Provjerite pravopis ili pokušajte s kraćim dijelom riječi.</p>
          </div>
        )}

        {error && (
          <div className={style.message}>
            <p className={style.messageTitle}>Došlo je do greške</p>
            <p>Rezultate trenutno nije moguće učitati. Pokušajte ponovo za nekoliko trenutaka.</p>
          </div>
        )}

        <div ref={sentinelRef} />
      </div>
    </>
  );
};

export default SearchResults;
