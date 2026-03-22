import type { NextConfig } from "next";



const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "*.supabase.co" },
    ],
  },
};

// Turbopack config for alias and root
export const turbopack = {
  root: __dirname,
  resolver: {
    alias: {
      '@': './src',
    },
  },
};

export default nextConfig;