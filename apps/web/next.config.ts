import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1"],
  output: "standalone",
  images: {
    qualities: [75, 82]
  },
  reactStrictMode: true,
  typedRoutes: false
};

export default nextConfig;
