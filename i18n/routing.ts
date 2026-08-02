import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  // `vi` is the primary locale served at the root path (`/`).
  // `en` gets the `/en` prefix (`localePrefix: "as-needed"`).
  locales: ["vi", "en"],
  defaultLocale: "vi",
  localePrefix: "as-needed",
});

export type Locale = (typeof routing.locales)[number];

export const defaultLocale: Locale = routing.defaultLocale as Locale;

/** Map each locale to its display label used by the language switcher. */
export const localeLabels: Record<Locale, string> = {
  vi: "Tiếng Việt",
  en: "English",
};
