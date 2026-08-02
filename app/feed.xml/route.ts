import { allWriteups, allResearch } from "@/.content-collections/generated";
import { profile } from "@/lib/profile";

const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://poqpwppy.dev";

type FeedItem = {
  title: string;
  link: string;
  description: string;
  date: string;
  categories: string[];
};

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function itemXml(item: FeedItem): string {
  const cats = item.categories
    .map((c) => `      <category>${escapeXml(c)}</category>`)
    .join("\n");
  return `  <item>
    <title>${escapeXml(item.title)}</title>
    <link>${escapeXml(item.link)}</link>
    <guid isPermaLink="true">${escapeXml(item.link)}</guid>
    <pubDate>${new Date(item.date).toUTCString()}</pubDate>
    <description>${escapeXml(item.description ?? "")}</description>
${cats}
  </item>`;
}

export function GET() {
  const items: FeedItem[] = [
    ...allWriteups.map((w) => ({
      title: w.title,
      link: `${base}/writeups/${w._meta.path}`,
      description: w.description ?? "",
      date: w.date,
      categories: [...w.categories, ...w.tags],
    })),
    ...allResearch.map((r) => ({
      title: r.title,
      link: `${base}/research/${r._meta.path}`,
      description: r.summary ?? "",
      date: r.date,
      categories: [r.category, ...r.tags],
    })),
  ].sort((a, b) => (a.date < b.date ? 1 : -1));

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${escapeXml(profile.handle)} — CTF & Security</title>
    <link>${base}</link>
    <description>Writeups and security research by ${escapeXml(
      profile.handle,
    )}.</description>
    <language>vi</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
${items.map(itemXml).join("\n")}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
