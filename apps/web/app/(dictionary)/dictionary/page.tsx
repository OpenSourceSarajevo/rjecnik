import type { Metadata } from 'next';

import SearchResults from './SearchResults';

import style from './page.module.css';

export const metadata: Metadata = {
  title: 'Pretraga',
  alternates: { canonical: '/rjecnik' },
};

const Dictionary = async ({ searchParams }: { searchParams: Promise<{ q?: string }> }) => {
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
