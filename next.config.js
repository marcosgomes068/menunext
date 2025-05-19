/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb', // Permite uploads de até 10MB
    },
  },
};

module.exports = nextConfig;
