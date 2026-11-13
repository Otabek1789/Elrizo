/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'raw.githubusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 't.me',
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/products',
        destination: '/catalog',
      },
      {
        source: '/auth',
        destination: '/login',
      },
      {
        source: '/webapp',
        destination: '/tg',
      },
    ];
  },
};

export default nextConfig;

