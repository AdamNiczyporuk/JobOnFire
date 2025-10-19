/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async rewrites() {
    const prefix = process.env.NEXT_PUBLIC_API_PREFIX || '/api/v1';
    const backend = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3040';
    return [
      {
        source: `${prefix}/:path*`,
        destination: `${backend}${prefix}/:path*`,
      },
    ];
  },
};

export default nextConfig;
