import type { NextConfig } from "next";
import { withContentCollections } from "@content-collections/next";
import createNextIntlPlugin from "next-intl/plugin";

const withIntl = createNextIntlPlugin("./i18n/request.ts");

const config: NextConfig = {
  output: "export",
  images: {
    unoptimized: true,
    formats: ["image/avif", "image/webp"],
  },
  // Speed: skip source maps in production builds
  productionBrowserSourceMaps: false,
  // Speed: inline critical CSS, reduce round-trips
  experimental: {
    optimizePackageImports: [
      "framer-motion",
      "recharts",
      "next-intl",
    ],
  },
};

export default withIntl(withContentCollections(config));
