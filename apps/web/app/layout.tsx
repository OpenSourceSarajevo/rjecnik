import type { Metadata } from 'next';
import { Inter, Source_Serif_4 } from 'next/font/google';
import { Analytics } from '@vercel/analytics/react';

import Header from './components/Header';
import Footer from './components/Footer';

import './globals.css';

const inter = Inter({
  subsets: ['latin', 'latin-ext', 'cyrillic'],
  variable: '--font-inter',
});

const sourceSerif = Source_Serif_4({
  subsets: ['latin', 'latin-ext', 'cyrillic'],
  variable: '--font-source-serif',
});

export const metadata: Metadata = {
  // Resolves relative canonical and Open Graph URLs to absolute ones
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL!),
  title: {
    default: 'Rječnik bosanskog jezika',
    template: '%s · Rječnik bosanskog jezika',
  },
  description:
    'Besplatni online rječnik bosanskog jezika s definicijama, oblicima riječi, sinonimima i antonimima.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="bs" className={`${inter.variable} ${sourceSerif.variable}`}>
      <body>
        <Header />
        <main>{children}</main>
        <Footer />
        <Analytics />
      </body>
    </html>
  );
}
