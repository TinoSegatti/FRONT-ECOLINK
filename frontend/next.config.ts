const nextConfig = {
  reactStrictMode: true, // Habilita el modo estricto de React
  swcMinify: true, // Habilita la minificación con SWC
  async rewrites() {
    return [
      {
        source: '/api/:path*', // Todas las solicitudes que comiencen con /api
        destination: 'http://localhost:3000/api/:path*', // Redirige al backend
      },
    ];
  },
};

module.exports = nextConfig;