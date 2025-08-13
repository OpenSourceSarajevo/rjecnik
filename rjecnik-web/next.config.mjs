/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
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
