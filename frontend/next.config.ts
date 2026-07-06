// frontend/next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "example.com", // Add the specific host from your error message here
      },
      {
        protocol: "https",
        hostname: "**.supabase.co", // Whitelist live Supabase cloud
      },
    ],
  },
};

export default nextConfig;
