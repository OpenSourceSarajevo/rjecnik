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
        source: '/obrada-rijeci',
        destination: '/process',
      },
    ];
  },
};

export default nextConfig;