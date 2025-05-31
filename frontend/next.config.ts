import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "anidoc-bucket.s3.ap-northeast-2.amazonaws.com",
        port: "",
        pathname: "/profile-images/**",
      },
    ],
  },
};

export default nextConfig;
