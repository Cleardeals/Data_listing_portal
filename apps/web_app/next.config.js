/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['tse1.mm.bing.net'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'tse1.mm.bing.net',
        pathname: '**',
      },
    ],
  },
};

module.exports = nextConfig;
