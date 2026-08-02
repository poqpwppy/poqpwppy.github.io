import type { Options } from "@content-collections/mdx";
import { compileMDX } from "@content-collections/mdx";
import type { Meta } from "@content-collections/core";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeKatex from "rehype-katex";
import rehypeShiki from "./rehype-shiki";
import remarkCallout from "./remark-callout";
import { rehypeCollectHeadings } from "./rehype-headings";

export type TocItem = {
  id: string;
  text: string;
  depth: number;
};

/**
 * Build the shared remark/rehype pipeline, appending a heading collector so
 * the caller can read the resulting table of contents after compiling.
 */
export function buildMdxOptions(toc: TocItem[] = []): Options {
  return {
    remarkPlugins: [remarkGfm, remarkMath, remarkCallout],
    rehypePlugins: [
      rehypeSlug,
      [
        rehypeAutolinkHeadings,
        {
          behavior: "append",
          properties: {
            className: ["heading-anchor"],
            "aria-label": "Link to this section",
          },
        },
      ],
      rehypeKatex,
      rehypeShiki,
      rehypeCollectHeadings(toc),
    ],
  };
}

/** Convenience wrapper for content collections transforms. */
export async function compileToHtml(
  context: Parameters<typeof compileMDX>[0],
  document: { _meta: Meta; content: string },
): Promise<{ html: string; toc: TocItem[] }> {
  const toc: TocItem[] = [];
  const html = await compileMDX(context, document, buildMdxOptions(toc));
  return { html, toc };
}

/** Rough reading time (minutes) from markdown source. */
export function readingTime(markdown: string): number {
  const plain = markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`]*`/g, " ")
    .replace(/[#>*_~\[\]()!|<>-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const words = plain ? plain.split(" ").length : 0;
  return Math.max(1, Math.round(words / 200));
}
