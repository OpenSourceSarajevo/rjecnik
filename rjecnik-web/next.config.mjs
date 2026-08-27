/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
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