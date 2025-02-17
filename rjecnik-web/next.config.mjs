/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  i18n: {
    locales: ["ba"],
    defaultLocale: "ba",
    localeDetection: false,
  },
  async rewrites() {
    return [
      {
        source: "/rjecnik",
        destination: "/dictionary",
      },
      {
        source: "/rjecnik/:word",
        destination: "/dictionary/:word",
      },
      {
        source: "/privatnost",
        destination: "/privacy",
      },
      {
        source: "/uslovi-koristenja",
        destination: "/terms",
      },
    ];
  },
};

export default nextConfig;
