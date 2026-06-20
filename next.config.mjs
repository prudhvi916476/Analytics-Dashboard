/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  allowedDevOrigins: ['192.168.0.104'],
  serverExternalPackages: ['sqlite3', 'sqlite'],
  experimental: {
    outputFileTracingIncludes: {
      '/api/**/*': ['./database.sqlite'],
    },
  },
};

export default nextConfig;
