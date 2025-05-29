const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  async rewrites() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    
    // Asegúrate de que la URL termine con /
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