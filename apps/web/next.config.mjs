/** @type {import('next').NextConfig} */
const staticExport = process.env.NEXT_OUTPUT === "export";

const nextConfig = {
  output: staticExport ? "export" : undefined,
  images: {
    unoptimized: staticExport,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com"
      }
    ]
  }
};

export default nextConfig;
