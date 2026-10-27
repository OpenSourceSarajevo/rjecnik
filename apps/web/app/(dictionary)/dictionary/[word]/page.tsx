import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

import { createClient } from '@/utils/supabase/server';
import WordEntry, { type WordDetails } from '@/app/components/WordEntry';

import ReportButton from './ReportButton';

import style from './page.module.css';

type PageProps = { params: Promise<{ word: string }> };

export const generateMetadata = async ({ params }: PageProps): Promise<Metadata> => {
  const { word } = await params;
  const headword = decodeURIComponent(word);

  return {
    title: `${headword} – značenje i definicija`,
    alternates: { canonical: `/rjecnik/${encodeURIComponent(headword)}` },
  };
};

const Page = async ({ params }: PageProps) => {
  const { word } = await params;
  const decodedHeadword = decodeURIComponent(word);

  const supabase = await createClient();
  const { data } = await supabase
    .from('words_v2')
    .select('id, headword, definitions, origins, alternatives, forms')
    .eq('headword', decodedHeadword)
    .maybeSingle<WordDetails>();

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
