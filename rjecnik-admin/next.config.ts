import type { NextConfig } from 'next';

const nextConfig: NextConfig = {  
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