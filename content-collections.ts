import { defineCollection, defineConfig } from "@content-collections/core";
import { z } from "zod";
import { compileToHtml, readingTime } from "./lib/mdx";

/* ── Jekyll frontmatter helpers ─────────────────────────────────
   Real posts use the Chirpy/Jekyll format:
     date: 2025-10-27 16:30:00 +0700
     categories: [Reverse Engineering, PicoCTF 2019, Hard]
   We keep those raw fields for fidelity and DERIVE the enum fields the
   UI needs (category/difficulty/platform/ctf) so stats, filters and the
   related-posts logic keep working unchanged.
   ─────────────────────────────────────────────────────────────── */

/** Jekyll allows a single value or a list. */
const strOrList = z.union([z.string(), z.array(z.string())]);
const toList = (v: unknown): string[] =>
  Array.isArray(v) ? v.map(String) : v ? [String(v)] : [];

/** "2025-10-27 16:30:00 +0700" → "2025-10-27" (date-only ISO). */
function toIsoDate(raw: unknown): string {
  if (raw instanceof Date && !Number.isNaN(raw.getTime())) {
    const p = (n: number) => String(n).padStart(2, "0");
    return `${raw.getFullYear()}-${p(raw.getMonth() + 1)}-${p(raw.getDate())}`;
  }
  const s = String(raw ?? "").trim();
  const m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (m) return `${m[1]}-${m[2]}-${m[3]}`;
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? s.slice(0, 10) : d.toISOString().slice(0, 10);
}

type WriteupCategory =
  | "web"
  | "pwn"
  | "crypto"
  | "reverse"
  | "forensics"
  | "osint"
  | "misc"
  | "network";
type WriteupDifficulty = "easy" | "medium" | "hard" | "insane";
type ResearchCategory = "vulnerability" | "methodology" | "analysis" | "tool" | "theory";

function deriveWriteupCategory(cats: string[]): WriteupCategory {
  const head = (cats[0] ?? "").toLowerCase();
  if (/(reverse|decompil|disassembl)/.test(head)) return "reverse";
  if (/(pwn|binary|bo.?f|heap|\bexploit\b)/.test(head)) return "pwn";
  if (/(crypto|rsa|aes|padding|hash)/.test(head)) return "crypto";
  if (/(forensic|memory|volatility|disk|pcap)/.test(head)) return "forensics";
  if (/osint/.test(head)) return "osint";
  if (/(network|tcp|dns|wire)/.test(head)) return "network";
  if (/(web|sql|php|deserial|ssti|xxe|idor|upload|graphql|lfi|smuggl|waf|proxy)/.test(head))
    return "web";
  return "misc";
}

function deriveDifficulty(cats: string[]): WriteupDifficulty {
  const hit = cats.find((c) => /^(easy|medium|hard|insane)$/i.test(c.trim()));
  return hit ? (hit.toLowerCase() as WriteupDifficulty) : "medium";
}

function deriveCtf(cats: string[]): { name?: string; year?: number } {
  const hit = cats.find((c) => /(ctf|pico|cybercon)/i.test(c));
  if (!hit) return {};
  const year = Number((hit.match(/(19|20)\d{2}/) ?? [])[0]);
  // Strip a trailing year so the detail page's "{ctfName} {ctfYear}" doesn't
  // duplicate it ("PicoCTF 2019" → name "PicoCTF", year 2019).
  const name = hit.replace(/\s*(?:19|20)\d{2}\s*$/, "").trim();
  return { name, year: Number.isNaN(year) ? undefined : year };
}

function deriveResearchCategory(cats: string[]): ResearchCategory {
  const joined = cats.join(" ").toLowerCase();
  if (/(vulnerab|cve|exploit|0day)/.test(joined)) return "vulnerability";
  if (/(tool|script|automation)/.test(joined)) return "tool";
  if (/(analys|forensic|investigat)/.test(joined)) return "analysis";
  if (/(theor|paper|math)/.test(joined)) return "theory";
  return "methodology";
}

/* ── Writeups ────────────────────────────────────────────────── */

const writeups = defineCollection({
  name: "writeups",
  parser: "frontmatter",
  directory: "content/writeups",
  include: "**/*.md",
  typeName: "Writeup",
  schema: z.object({
    title: z.string(),
    date: z.union([z.string(), z.date()]),
    categories: strOrList.default([]),
    tags: strOrList.default([]),
    author: z.string().default("khoa"),
    description: z.string().optional(),
    toc: z.boolean().default(true),
    comments: z.boolean().default(true),
    content: z.string(),
  }),
  transform: async (data, context) => {
    const { html, toc } = await compileToHtml(context, data);
    const date = toIsoDate(data.date);
    const categories = toList(data.categories);
    const ctf = deriveCtf(categories);
    return {
      ...data,
      date,
      categories,
      tags: toList(data.tags),
      html,
      toc,
      readingTime: readingTime(data.content),
      year: Number(date.slice(0, 4)),
      category: deriveWriteupCategory(categories),
      difficulty: deriveDifficulty(categories),
      ctfName: ctf.name,
      ctfYear: ctf.year,
    };
  },
});

/* ── Research ────────────────────────────────────────────────── */

const research = defineCollection({
  name: "research",
  parser: "frontmatter",
  directory: "content/research",
  include: "**/*.md",
  typeName: "Research",
  schema: z.object({
    title: z.string(),
    date: z.union([z.string(), z.date()]),
    categories: strOrList.default([]),
    tags: strOrList.default([]),
    author: z.string().default("khoa"),
    description: z.string().optional(),
    toc: z.boolean().default(true),
    comments: z.boolean().default(true),
    content: z.string(),
  }),
  transform: async (data, context) => {
    const { html, toc } = await compileToHtml(context, data);
    const date = toIsoDate(data.date);
    const categories = toList(data.categories);
    return {
      ...data,
      date,
      categories,
      tags: toList(data.tags),
      html,
      toc,
      readingTime: readingTime(data.content),
      year: Number(date.slice(0, 4)),
      category: deriveResearchCategory(categories),
      status: "published" as const,
      summary: data.description ?? "",
    };
  },
});

/* ── Tools / certs / journey / stats (unchanged) ─────────────── */

const tools = defineCollection({
  name: "tools",
  parser: "yaml",
  directory: "content/tools",
  include: "*.yaml",
  typeName: "Tool",
  schema: z.object({
    name: z.string(),
    description: z.string(),
    category: z.enum([
      "recon",
      "exploitation",
      "post-exploitation",
      "crypto",
      "forensics",
      "utility",
    ]),
    language: z.string(),
    repository: z.string(),
    license: z.string().default("MIT"),
    stars: z.number().optional(),
    maintained: z.boolean().default(true),
    tags: z.array(z.string()).default([]),
  }),
});

const certifications = defineCollection({
  name: "certifications",
  parser: "yaml",
  directory: "content/certifications",
  include: "*.yaml",
  typeName: "Certification",
  schema: z.object({
    name: z.string(),
    issuer: z.string(),
    year: z.number(),
    status: z.enum(["earned", "in-progress"]).default("earned"),
    url: z.string().optional(),
  }),
});

const journey = defineCollection({
  name: "journey",
  parser: "yaml",
  directory: "content/journey",
  include: "*.yaml",
  typeName: "JourneyEntry",
  schema: z.object({
    entries: z.array(
      z.object({
        period: z.string(),
        title: z.string(),
        org: z.string().optional(),
        description: z.string(),
        type: z.enum(["education", "experience", "milestone"]),
      }),
    ),
  }),
});

const ratingHistory = defineCollection({
  name: "ratingHistory",
  parser: "yaml",
  directory: "content/stats",
  include: "rating.yaml",
  typeName: "RatingHistory",
  schema: z.object({
    entries: z.array(
      z.object({
        date: z.string(),
        rating: z.number(),
      }),
    ),
  }),
});

const platformStats = defineCollection({
  name: "platformStats",
  parser: "yaml",
  directory: "content/stats",
  include: "platforms.yaml",
  typeName: "PlatformStats",
  schema: z.object({
    platforms: z.array(
      z.object({
        platform: z.enum(["hackthebox", "tryhackme", "ctftime", "rootme"]),
        points: z.number(),
        rank: z.number().optional(),
        solves: z.number().optional(),
        url: z.string().optional(),
      }),
    ),
  }),
});

export default defineConfig({
  cache: "file",
  content: [
    writeups,
    research,
    tools,
    certifications,
    journey,
    ratingHistory,
    platformStats,
  ],
});
