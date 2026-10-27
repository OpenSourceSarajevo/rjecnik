import type { Metadata } from 'next';

import SearchResults from './SearchResults';

import style from './page.module.css';

type PageProps = { searchParams: Promise<{ q?: string }> };

export const generateMetadata = async ({ searchParams }: PageProps): Promise<Metadata> => {
  const { q } = await searchParams;

  // Search URLs render no results on the server, so keep them out of the index
  if (q) {
    return { title: 'Pretraga', robots: { index: false, follow: true } };
  }

  return { title: 'Pretraga', alternates: { canonical: '/rjecnik' } };
};

const Dictionary = async ({ searchParams }: PageProps) => {
  const { q } = await searchParams;

  return (
    <div className={`container ${style.page}`}>
      <div className={style.heading}>
        <h1 className={style.title}>Pretraga</h1>
        <p className={style.subtitle}>
          Upišite riječ ili njen dio. Rezultati se prikazuju dok kucate.
        </p>
      </div>
      <SearchResults initialQuery={q ?? ''} />
    </div>
  );
};

export default Dictionary;
