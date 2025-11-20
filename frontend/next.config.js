/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@remotion/player': require.resolve('@remotion/player'),
    };
    return config;
  },
}

module.exports = nextConfig
