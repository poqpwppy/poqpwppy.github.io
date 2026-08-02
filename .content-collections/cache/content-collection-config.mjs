// content-collections.ts
import { defineCollection, defineConfig } from "@content-collections/core";
import { z } from "zod";

// lib/mdx.ts
import { compileMDX } from "@content-collections/mdx";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeKatex from "rehype-katex";

// lib/rehype-shiki.ts
import { visit } from "unist-util-visit";
import { codeToHtml } from "shiki";
import { transformerNotationHighlight } from "@shikijs/transformers";
import { fromHtml } from "hast-util-from-html";
var escapeAttr = (s) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
var parseMeta = (meta) => {
  const filename = meta.split(/\s+/).find((p) => p.startsWith("filename="))?.replace("filename=", "").replace(/^["']|["']$/g, "");
  return { filename };
};
var rehypeShiki = () => {
  return async (tree) => {
    const matches = [];
    visit(tree, "element", (node, index, parent) => {
      if (node.tagName !== "pre" || !parent || index === void 0) return;
      const codeNode = node.children.find(
        (c) => c.type === "element" && c.tagName === "code"
      );
      if (!codeNode) return;
      const className = codeNode.properties?.className;
      const langMatch = Array.isArray(className) ? className.find(
        (c) => typeof c === "string" && c.startsWith("language-")
      ) : null;
      if (langMatch) {
        const code = codeNode.children.filter((c) => c.type === "text").map((c) => c.value).join("");
        matches.push({
          parent,
          index,
          code,
          lang: String(langMatch).replace("language-", "") || "text",
          meta: String(
            node.properties?.meta ?? node.properties?.dataMeta ?? ""
          )
        });
      }
    });
    for (const m of matches) {
      try {
        const highlighted = await codeToHtml(m.code, {
          lang: m.lang,
          theme: "github-dark-default",
          transformers: [transformerNotationHighlight()],
          meta: m.meta ? { __raw: m.meta } : void 0
        });
        const { filename } = parseMeta(m.meta);
        const langLabel = m.lang === "text" ? "" : m.lang;
        const encoded = Buffer.from(m.code).toString("base64");
        const wrapped = `<div class="codeblock">
  <div class="codeblock-bar">
    ${filename ? `<span class="codeblock-file">${escapeAttr(filename)}</span>` : ""}
    ${langLabel ? `<span class="codeblock-lang">${escapeAttr(langLabel)}</span>` : ""}
    <button type="button" class="codeblock-copy" data-code="${encoded}" aria-label="Copy code">copy</button>
  </div>
  ${highlighted}
</div>`;
        const hast = fromHtml(wrapped, { fragment: true });
        const node = hast.children[0];
        if (node && node.type === "element" && node.tagName === "div") {
          m.parent.children[m.index] = node;
        }
      } catch {
      }
    }
  };
};
var rehype_shiki_default = rehypeShiki;

// lib/remark-callout.ts
import { visit as visit2 } from "unist-util-visit";
var CALLOUTS = {
  NOTE: "note",
  WARNING: "warning",
  TIP: "tip",
  DANGER: "danger",
  INFO: "info"
};
var remarkCallout = () => (tree) => {
  visit2(tree, "blockquote", (node, index, parent) => {
    if (index === void 0 || !parent) return;
    const first = node.children[0];
    if (first?.type !== "paragraph") return;
    const text = first.children[0];
    if (text?.type !== "text") return;
    const match = text.value.match(/^\s*\[!([A-Za-z]+)\]\s*/);
    if (!match) return;
    const key = match[1].toUpperCase();
    const type = CALLOUTS[key];
    if (!type) return;
    text.value = text.value.replace(/^\s*\[![A-Za-z]+\]\s*/, "");
    node.data = {
      hProperties: { className: ["callout", `callout-${type}`] }
    };
  });
};
var remark_callout_default = remarkCallout;

// lib/rehype-headings.ts
import { visit as visit3 } from "unist-util-visit";
function getNodeText(node) {
  if (node.type === "text") return node.value;
  if (node.type === "element" && node.children) {
    return node.children.map(getNodeText).join("");
  }
  return "";
}
function rehypeCollectHeadings(target) {
  return () => (tree) => {
    visit3(tree, "element", (node) => {
      if (/^h[1-4]$/.test(node.tagName)) {
        const id = String(node.properties?.id ?? "");
        const text = node.children.map(getNodeText).join(" ").replace(/\s+/g, " ").trim();
        if (text) {
          target.push({
            id: id || text.toLowerCase().replace(/[^\w]+/g, "-"),
            text,
            depth: Number(node.tagName[1])
          });
        }
      }
    });
  };
}

// lib/mdx.ts
function buildMdxOptions(toc = []) {
  return {
    remarkPlugins: [remarkGfm, remarkMath, remark_callout_default],
    rehypePlugins: [
      rehypeSlug,
      [
        rehypeAutolinkHeadings,
        {
          behavior: "append",
          properties: {
            className: ["heading-anchor"],
            "aria-label": "Link to this section"
          }
        }
      ],
      rehypeKatex,
      rehype_shiki_default,
      rehypeCollectHeadings(toc)
    ]
  };
}
async function compileToHtml(context, document) {
  const toc = [];
  const html = await compileMDX(context, document, buildMdxOptions(toc));
  return { html, toc };
}
function readingTime(markdown) {
  const plain = markdown.replace(/```[\s\S]*?```/g, " ").replace(/`[^`]*`/g, " ").replace(/[#>*_~\[\]()!|<>-]/g, " ").replace(/\s+/g, " ").trim();
  const words = plain ? plain.split(" ").length : 0;
  return Math.max(1, Math.round(words / 200));
}

// content-collections.ts
var strOrList = z.union([z.string(), z.array(z.string())]);
var toList = (v) => Array.isArray(v) ? v.map(String) : v ? [String(v)] : [];
function toIsoDate(raw) {
  if (raw instanceof Date && !Number.isNaN(raw.getTime())) {
    const p = (n) => String(n).padStart(2, "0");
    return `${raw.getFullYear()}-${p(raw.getMonth() + 1)}-${p(raw.getDate())}`;
  }
  const s = String(raw ?? "").trim();
  const m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (m) return `${m[1]}-${m[2]}-${m[3]}`;
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? s.slice(0, 10) : d.toISOString().slice(0, 10);
}
function deriveWriteupCategory(cats) {
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
function deriveDifficulty(cats) {
  const hit = cats.find((c) => /^(easy|medium|hard|insane)$/i.test(c.trim()));
  return hit ? hit.toLowerCase() : "medium";
}
function deriveCtf(cats) {
  const hit = cats.find((c) => /(ctf|pico|cybercon)/i.test(c));
  if (!hit) return {};
  const year = Number((hit.match(/(19|20)\d{2}/) ?? [])[0]);
  const name = hit.replace(/\s*(?:19|20)\d{2}\s*$/, "").trim();
  return { name, year: Number.isNaN(year) ? void 0 : year };
}
function deriveResearchCategory(cats) {
  const joined = cats.join(" ").toLowerCase();
  if (/(vulnerab|cve|exploit|0day)/.test(joined)) return "vulnerability";
  if (/(tool|script|automation)/.test(joined)) return "tool";
  if (/(analys|forensic|investigat)/.test(joined)) return "analysis";
  if (/(theor|paper|math)/.test(joined)) return "theory";
  return "methodology";
}
var writeups = defineCollection({
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
    content: z.string()
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
      ctfYear: ctf.year
    };
  }
});
var research = defineCollection({
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
    content: z.string()
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
      status: "published",
      summary: data.description ?? ""
    };
  }
});
var tools = defineCollection({
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
      "utility"
    ]),
    language: z.string(),
    repository: z.string(),
    license: z.string().default("MIT"),
    stars: z.number().optional(),
    maintained: z.boolean().default(true),
    tags: z.array(z.string()).default([])
  })
});
var certifications = defineCollection({
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
    url: z.string().optional()
  })
});
var journey = defineCollection({
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
        type: z.enum(["education", "experience", "milestone"])
      })
    )
  })
});
var ratingHistory = defineCollection({
  name: "ratingHistory",
  parser: "yaml",
  directory: "content/stats",
  include: "rating.yaml",
  typeName: "RatingHistory",
  schema: z.object({
    entries: z.array(
      z.object({
        date: z.string(),
        rating: z.number()
      })
    )
  })
});
var platformStats = defineCollection({
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
        url: z.string().optional()
      })
    )
  })
});
var content_collections_default = defineConfig({
  cache: "file",
  content: [
    writeups,
    research,
    tools,
    certifications,
    journey,
    ratingHistory,
    platformStats
  ]
});
export {
  content_collections_default as default
};
