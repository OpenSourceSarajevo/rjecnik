import { cache } from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

import { createStaticClient } from '@/utils/supabase/server';
import WordEntry, { type WordDetails } from '@/app/components/WordEntry';
import { openGraphDefaults } from '@/app/shared-metadata';

import ReportButton from './ReportButton';

import style from './page.module.css';

type PageProps = { params: Promise<{ word: string }> };

// Built on first visit, then served from cache and regenerated at most once an hour
export const revalidate = 3600;

export const generateStaticParams = async () => [];

// Deduplicates the query between generateMetadata and the page
const getWord = cache(async (headword: string) => {
  const supabase = createStaticClient();
  const { data } = await supabase
    .from('words_v2')
    .select('id, headword, definitions, origins, alternatives, forms')
    .eq('headword', headword)
    .maybeSingle<WordDetails>();

  return data;
});

export const generateMetadata = async ({ params }: PageProps): Promise<Metadata> => {
  const { word } = await params;
  const data = await getWord(decodeURIComponent(word));
  if (data === null) return {};

  const title = `${data.headword} – značenje i definicija`;
  const url = `/rjecnik/${encodeURIComponent(data.headword)}`;

  return {
    title,
    alternates: { canonical: url },
    openGraph: { ...openGraphDefaults, title, url },
  };
};

const Page = async ({ params }: PageProps) => {
  const { word } = await params;
  const data = await getWord(decodeURIComponent(word));

  if (data === null) {
    notFound();
  }

  const githubUrl = process.env.NEXT_PUBLIC_GITHUB_REPOSITORY;

  return (
    <div className={`container ${style.page}`}>
      <Link href="/rjecnik" className={style.back}>
        <ArrowLeft size={16} aria-hidden="true" />
        Nazad na pretragu
      </Link>

      <div className={style.entry}>
        <WordEntry word={data} action={<ReportButton word={data.headword} />} />
      </div>

      <p className={style.note}>
        Podaci su digitalizovani automatski i mogu sadržavati greške. Primijetili ste grešku?{' '}
        <a href={`${githubUrl}/issues`} target="_blank" rel="noopener noreferrer">
          Javite nam na GitHubu
        </a>
        .
      </p>
    </div>
  );
};

export default Page;
