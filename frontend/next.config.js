/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      'picsum.photos',
      'localhost',
      'thumbs.dreamstime.com',
      'dreamstime.com',
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.dreamstime.com',
      },
      {
        protocol: 'https',
        hostname: '**.picsum.photos',
      },
    ],
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  },
};

module.exports = nextConfig;

