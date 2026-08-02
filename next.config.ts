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

// `withContentCollections` is async (returns a Promise). It must be the
// OUTERMOST wrapper so Next.js awaits the resolved config; otherwise
// `withIntl` (sync) copies nothing out of the pending Promise and every
// custom option below (`output: "export"`, images, …) is silently dropped.
export default withContentCollections(withIntl(config));
