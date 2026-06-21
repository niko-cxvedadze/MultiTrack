import type { NextConfig } from "next";
import { loadEnvConfig } from "@next/env";
import createNextIntlPlugin from "next-intl/plugin";
import path from "path";

// Load .env from monorepo root (same pattern as apps/web vite.config.ts)
loadEnvConfig(path.join(__dirname, "../.."));

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig: NextConfig = {
  turbopack: {
    root: path.join(__dirname, "../.."),
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.alldrive.ge",
      },
      {
        protocol: "https",
        hostname: "cdn.printa.ge",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
    formats: ["image/avif", "image/webp"],
  },
};

export default withNextIntl(nextConfig);
