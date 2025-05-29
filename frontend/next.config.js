/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true, // Habilita el modo estricto de React
  async rewrites() {
    return [
      {
        source: '/api/:path*', // Todas las solicitudes que comiencen con /api
        destination: `${process.env.NEXT_PUBLIC_DEFAULT_URL}/api/:path*`, // Redirige al backend
      },
    ];
  },
};

module.exports = nextConfig;