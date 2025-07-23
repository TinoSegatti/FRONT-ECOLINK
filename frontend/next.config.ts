// const nextConfig = {
//   reactStrictMode: true, // Habilita el modo estricto de React
//   //swcMinify: true, // Habilita la minificación con SWC
//   async rewrites() {
//     return [
//       {
//         source: '/api/:path*', // Todas las solicitudes que comiencen con /api
//         destination: 'http://localhost:3000/api/:path*', // Redirige al backend
//       },
//     ];
//   },
// };

// module.exports = nextConfig;

// ------- PARA PRODUCCIO ----------

const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://back-ecolink-3.onrender.com';
    
    // Asegúrate de que la URL no termine con /
    const formattedApiUrl = apiUrl.endsWith('/') ? apiUrl.slice(0, -1) : apiUrl;
    
    return [
      {
        source: '/api/:path*',
        destination: `${formattedApiUrl}/api/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;


// ------- PARA PRODUCCIO ----------

