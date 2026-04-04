/** @type {import('next').NextConfig} */
const nextConfig = {
  /** 与 Vercel 项目若误设 Output Directory 为 dist 时对齐；官方推荐在控制台留空输出目录 */
  distDir: "dist",
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "placehold.co",
      },
    ],
  },
};

module.exports = nextConfig;
