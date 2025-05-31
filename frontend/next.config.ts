const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  async rewrites() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://back-ecolink-3.onrender.com';
    
    // Asegúrate de que la URL no termine con /
    const formattedApiUrl = apiUrl.endsWith('/') ? apiUrl.slice(0, -1) : apiUrl;
    
    return [
      {
        source: '/api/:path*',
        destination: `${formattedApiUrl}/api/v1/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;