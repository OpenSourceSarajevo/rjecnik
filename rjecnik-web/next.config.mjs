/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  i18n: {
    locales: ["ba"],
    defaultLocale: "ba",
    localeDetection: false,
  },
  async rewrites() {
    console.log("Rewrites called");
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
        source: "/kontakt",
        destination: "/contact",
      },
    ];
  },
};

export default nextConfig;
