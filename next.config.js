/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [],
    unoptimized: true,
  },
  experimental: {
    serverComponentsExternalPackages: ['leaflet'],
  },
};

module.exports = nextConfig;
