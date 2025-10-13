/** @type {import('next').NextConfig} */
module.exports = {
  eslint: {
    // Only error on errors, not warnings during production builds
    ignoreDuringBuilds: false,
  },
  images: {
    loader: 'custom',
    formats: ['image/avif', 'image/webp'],
  },
};
