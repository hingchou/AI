const withNextIntl = require('next-intl/plugin')();

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'localhost',
      'aiwallpaper.shop',
      'r2.trys.ai',  // 如果你使用了 R2 存储
    ],
  },
};

module.exports = withNextIntl(nextConfig); 