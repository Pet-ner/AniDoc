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
  // 추가
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://localhost:8090/api/:path*",
      },
    ];
  },
};

export default nextConfig;
