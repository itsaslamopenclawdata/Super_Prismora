/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@photoidentifier/types', '@photoidentifier/utils'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};

module.exports = nextConfig;
