/** @type {import('next').NextConfig} */
const nextConfig = {
  // 🔥 THE MAGIC FIX: Ye Tldraw (WebGL) ko baar-baar mount/unmount hone se rokega
  reactStrictMode: false,
  
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
};

export default nextConfig;