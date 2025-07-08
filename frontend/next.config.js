// C:\ECOLINK\crud-clientes - v2.1\frontend\next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/api/auth/:path*',
        destination: `${process.env.NEXT_PUBLIC_DEFAULT_URL || 'https://back-ecolink-3.onrender.com'}/api/auth/:path*`, // CORRECCIÓN: /api/auth -> /api/auth
      },
    ]
  },
}

module.exports = nextConfig