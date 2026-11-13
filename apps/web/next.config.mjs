/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@org/ui', '@org/shared', '@org/internal-sdk'],
};

export default nextConfig;

