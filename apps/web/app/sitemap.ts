import type { MetadataRoute } from 'next';

import { createStaticClient } from '@/utils/supabase/server';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL!;
// Supabase caps a single select at 1000 rows
const BATCH_SIZE = 1000;

export const revalidate = 86400;

const getHeadwords = async () => {
  const supabase = createStaticClient();
  const headwords: string[] = [];

  for (let from = 0; ; from += BATCH_SIZE) {
    const { data, error } = await supabase
      .from('words_v2')
      .select('headword')
      .order('id')
      .range(from, from + BATCH_SIZE - 1);

    if (error) throw error;

    headwords.push(...data.map((row) => row.headword));
    if (data.length < BATCH_SIZE) break;
  }

  return headwords;
};

const sitemap = async (): Promise<MetadataRoute.Sitemap> => {
  const headwords = await getHeadwords();

  return [
    { url: SITE_URL, changeFrequency: 'monthly', priority: 1 },
    { url: `${SITE_URL}/rjecnik`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE_URL}/privatnost`, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${SITE_URL}/uslovi-koristenja`, changeFrequency: 'yearly', priority: 0.2 },
    ...headwords.map((headword) => ({
      url: `${SITE_URL}/rjecnik/${encodeURIComponent(headword)}`,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    })),
  ];
};

export default sitemap;
