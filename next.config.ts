import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Opt these out of Next.js bundling so they're loaded via native Node `require`
  // at runtime. pdf-parse v2 uses pdfjs-dist, which expects its worker file to be
  // resolvable on disk — bundling breaks worker loading.
  serverExternalPackages: ["pdf-parse", "pdfjs-dist"],
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
};

export default nextConfig;
