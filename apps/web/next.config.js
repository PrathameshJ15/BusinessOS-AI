/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@businessos/shared', '@businessos/auth', '@businessos/ai', '@businessos/database', '@businessos/ui', '@businessos/config'],
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client'],
    cpus: 1,
    workerThreads: false,
  },
};

module.exports = nextConfig;
