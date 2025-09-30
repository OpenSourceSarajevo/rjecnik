/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  async rewrites() {
    return [      
      {
        source: '/kontrolna-tabla',
        destination: '/dashboard',
      },
      {
        source: '/ucitaj-tekst',
        destination: '/upload',
      },
      {
        source: '/obrada-rijeci',
        destination: '/process',
      },      
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
