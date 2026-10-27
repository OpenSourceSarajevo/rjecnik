import type { Metadata } from 'next';

export const SITE_NAME = 'Rječnik bosanskog jezika';

export const SITE_DESCRIPTION =
  'Besplatni online rječnik bosanskog jezika s definicijama, oblicima riječi, sinonimima i antonimima.';

// Pages that set their own openGraph replace the layout's, so they spread this in
export const openGraphDefaults: Metadata['openGraph'] = {
  type: 'website',
  siteName: SITE_NAME,
  locale: 'bs_BA',
};
