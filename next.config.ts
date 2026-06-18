import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Allow product image uploads (stored as data URLs) through server actions.
      bodySizeLimit: "8mb",
    },
  },
};

export default nextConfig;
