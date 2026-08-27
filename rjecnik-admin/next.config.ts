import path from 'path';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Pin the workspace root explicitly — otherwise Next.js walks up from cwd looking
  // for lockfiles and can lock onto an unrelated one (e.g. ~/package-lock.json),
  // which causes flaky dev-server behavior (stale 404s, wrong static asset MIME types).
  outputFileTracingRoot: path.join(__dirname),

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '**',
      },
    ],
  },

  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Content-Security-Policy', value: "frame-ancestors 'self'" },
        ],
      },
    ];
  },

  async rewrites() {
    return [
      {
        source: '/kontrolna-tabla',
        destination: '/dashboard',
      },
      {
        source: '/rjecnik',
        destination: '/dictionary',
      },
      {
        source: '/ucitaj-tekst',
        destination: '/upload',
      },
      {
        source: '/obradi-rijeci',
        destination: '/process',
      },
    ];
  },
};

export default nextConfig;