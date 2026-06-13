import type { NextConfig } from "next";
import { execSync } from "node:child_process";

const apiProxyUrl = (process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || `http://127.0.0.1:${process.env.API_PORT || 4000}`).replace(/\/+$/, "");

// Build-time stamp used to cache-bust the static template assets. Resolved once at
// build/start so every deploy gets a fresh `?v=` while assets stay `immutable` in cache.
function resolveAssetVersion() {
  if (process.env.NEXT_PUBLIC_ASSET_VERSION) return process.env.NEXT_PUBLIC_ASSET_VERSION;
  try {
    const sha = execSync("git rev-parse --short HEAD", { stdio: ["ignore", "pipe", "ignore"] }).toString().trim();
    if (sha) return sha;
  } catch {
    // git unavailable in the build environment — fall through to a stable default.
  }
  return "v1";
}

const assetVersion = resolveAssetVersion();

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1"],
  output: "standalone",
  images: {
    qualities: [75, 82]
  },
  reactStrictMode: true,
  typedRoutes: false,
  env: {
    NEXT_PUBLIC_ASSET_VERSION: assetVersion
  },
  async headers() {
    return [
      {
        // Vendor/template assets are versioned via `?v=` (see templateAssets.ts),
        // so they are safe to cache aggressively. Eliminates re-downloading
        // ~1.4MB CSS + ~648KB JS on every navigation / repeat visit.
        source: "/template-assets/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }]
      }
    ];
  },
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
