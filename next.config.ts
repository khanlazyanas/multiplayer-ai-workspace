/** @type {import('next').NextConfig} */
const nextConfig = {
  // 🔥 THE MAGIC FIX: Ye Tldraw (WebGL) ko baar-baar mount/unmount hone se rokega
  reactStrictMode: false,
  
  // 🔥 THE VERCEL KILL-SWITCH: Vercel production compression band karega taaki Canvas crash na ho
  swcMinify: false, 
  
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