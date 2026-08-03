import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  // `output: "export"` cannot run the middleware, so next-intl can't strip the
  // default locale's prefix at runtime — `/about` would have no file behind it
  // (GitHub Pages would 404). Use `localePrefix: "always"` so every path is
  // explicitly prefixed and the exported files always match the links:
  //   /vi/... → tiếng Việt, /en/... → English.
  // The root `/` redirects to `/vi` (see scripts/ensure-root-page.mjs).
  locales: ["vi", "en"],
  defaultLocale: "vi",
  localePrefix: "always",
});

export type Locale = (typeof routing.locales)[number];

export const defaultLocale: Locale = routing.defaultLocale as Locale;

/** Map each locale to its display label used by the language switcher. */
export const localeLabels: Record<Locale, string> = {
  vi: "Tiếng Việt",
  en: "English",
};
