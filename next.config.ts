import type { NextConfig } from "next";
import path from "path";
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
    optimizePackageImports: ["framer-motion", "recharts"],
  },
  webpack(config, context) {
    // Belt-and-suspenders for `createNextIntlPlugin`. The plugin registers
    // this alias through its own `webpack` wrapper; declaring it here too
    // guarantees `next-intl/config` always resolves to the request config,
    // even if the plugin's wrapper is not applied in a given compilation.
    // Without the alias, `next-intl/config` resolves to the package's stub
    // (`dist/esm/production/config.js`), which throws "Couldn't find
    // next-intl config file" at prerender time.
    config.resolve = config.resolve ?? {};
    config.resolve.alias = config.resolve.alias ?? {};
    config.resolve.alias["next-intl/config"] = path.resolve(
      context.dir,
      "./i18n/request.ts",
    );
    return config;
  },
};

// `withContentCollections` is async (returns a Promise). It must be the
// OUTERMOST wrapper so Next.js awaits the resolved config; otherwise
// `withIntl` (sync) copies nothing out of the pending Promise and every
// custom option below (`output: "export"`, images, …) is silently dropped.
export default withContentCollections(withIntl(config));
