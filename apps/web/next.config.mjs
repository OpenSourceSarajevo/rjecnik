import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  // Pin the workspace root explicitly — otherwise Next.js walks up from cwd looking
  // for lockfiles and can lock onto an unrelated one (e.g. ~/package-lock.json),
  // which causes flaky dev-server behavior (stale 404s, wrong static asset MIME types).
  // outputFileTracingRoot covers the webpack build; turbopack.root covers `next dev`
  // (Turbopack is the default dev bundler as of Next.js 16).
  outputFileTracingRoot: __dirname,
  turbopack: {
    root: __dirname,
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Content-Security-Policy',
            value: "frame-ancestors 'self'",
          },
        ],
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: '/rjecnik',
        destination: '/dictionary',
      },
      {
        source: '/rjecnik/:word',
        destination: '/dictionary/:word',
      },
      {
        source: '/privatnost',
        destination: '/privacy',
      },
      {
        source: '/uslovi-koristenja',
        destination: '/terms',
      },
    ];
  },
};

export default nextConfig;