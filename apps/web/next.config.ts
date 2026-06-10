import type { NextConfig } from "next";

const apiProxyUrl = (process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || `http://127.0.0.1:${process.env.API_PORT || 4000}`).replace(/\/+$/, "");

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1"],
  output: "standalone",
  images: {
    qualities: [75, 82]
  },
  reactStrictMode: true,
  typedRoutes: false,
  async rewrites() {
    return [
      { source: "/public/:path*", destination: `${apiProxyUrl}/public/:path*` },
      { source: "/auth/:path*", destination: `${apiProxyUrl}/auth/:path*` },
      { source: "/admin/:path*", destination: `${apiProxyUrl}/admin/:path*` },
      { source: "/uploads/:path*", destination: `${apiProxyUrl}/uploads/:path*` }
    ];
  }
};

export default nextConfig;
