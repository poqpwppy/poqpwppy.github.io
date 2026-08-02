import type { MetadataRoute } from "next";
import { allWriteups, allResearch } from "@/.content-collections/generated";

const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://poqpwppy.dev";

/** Static routes shared by every locale (vi at root, en under /en). */
const STATIC = [
  "",
  "/writeups",
  "/research",
  "/tools",
  "/about",
  "/contact",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];

  for (const locale of ["vi", "en"] as const) {
    const prefix = locale === "vi" ? "" : `/${locale}`;

    for (const p of STATIC) {
      entries.push({
        url: `${base}${prefix}${p}`,
        lastModified: new Date(),
        changeFrequency: p === "" ? "weekly" : "monthly",
        priority: p === "" ? 1 : 0.8,
      });
    }

    for (const w of allWriteups) {
      entries.push({
        url: `${base}${prefix}/writeups/${w._meta.path}`,
        lastModified: new Date(w.date),
        changeFrequency: "monthly",
        priority: 0.7,
      });
    }

    for (const r of allResearch) {
      entries.push({
        url: `${base}${prefix}/research/${r._meta.path}`,
        lastModified: new Date(r.date),
        changeFrequency: "monthly",
        priority: 0.7,
      });
    }
  }

  return entries;
}
