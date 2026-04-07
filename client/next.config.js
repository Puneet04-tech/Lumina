/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  output: 'export',  // Enable static export for Netlify
  images: {
    unoptimized: true,
  },
  // Optimize for production
  compress: true,
  // Support for environment variables
  env: {
    API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3500',
  },
  // Headers for security
  // Note: Headers won't work with static export, security is handled by Netlify headers
  
  // Redirects and rewrites
  async redirects() {
    return [];
  },
  // Rewrites won't work with static export - API calls go directly to backend
};

export default nextConfig;
