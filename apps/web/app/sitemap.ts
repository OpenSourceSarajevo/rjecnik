import type { MetadataRoute } from 'next';

import { apiFetch } from '@/utils/api';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL!;

export const revalidate = 86400;

const sitemap = async (): Promise<MetadataRoute.Sitemap> => {
  const headwords = await apiFetch<string[]>('/words/headwords', {
    next: { revalidate },
  });

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
