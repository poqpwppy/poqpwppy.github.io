import type { Element, Root, Text } from "hast";
import type { Plugin } from "unified";
import { visit } from "unist-util-visit";
import { codeToHtml } from "shiki";
import { transformerNotationHighlight } from "@shikijs/transformers";
import { fromHtml } from "hast-util-from-html";

const escapeAttr = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");

const parseMeta = (meta: string) => {
  const filename = meta
    .split(/\s+/)
    .find((p) => p.startsWith("filename="))
    ?.replace("filename=", "")
    .replace(/^["']|["']$/g, "");
  return { filename };
};

/**
 * Rehype plugin that highlights `<pre><code class="language-*">` blocks with
 * Shiki at build time, wrapped in a decorated chrome:
 *
 * ```
 * <div class="codeblock" data-code="<base64>">
 *   <div class="codeblock-bar">
 *     <span class="codeblock-file">filename</span>
 *     <span class="codeblock-lang">lang</span>
 *     <button type="button" class="codeblock-copy" data-code="...">copy</button>
 *   </div>
 *   <pre class="shiki …">…</pre>
 * </div>
 * ```
 *
 * Supports:
 *  - `filename="path.js"` in the fence meta
 *  - `// [!code highlight]` line highlighting
 */
const rehypeShiki: Plugin<[], Root> = () => {
  return async (tree: Root) => {
    const matches: {
      parent: Element | Root;
      index: number;
      code: string;
      lang: string;
      meta: string;
    }[] = [];

    visit(tree, "element", (node, index, parent) => {
      if (node.tagName !== "pre" || !parent || index === undefined) return;
      const codeNode = node.children.find(
        (c): c is Element => c.type === "element" && c.tagName === "code",
      );
      if (!codeNode) return;

      const className = codeNode.properties?.className;
      const langMatch = Array.isArray(className)
        ? className.find(
            (c) => typeof c === "string" && c.startsWith("language-"),
          )
        : null;

      if (langMatch) {
        const code = codeNode.children
          .filter((c): c is Text => c.type === "text")
          .map((c) => c.value)
          .join("");
        matches.push({
          parent,
          index,
          code,
          lang: String(langMatch).replace("language-", "") || "text",
          meta: String(
            node.properties?.meta ?? node.properties?.dataMeta ?? "",
          ),
        });
      }
    });

    for (const m of matches) {
      try {
        const highlighted = await codeToHtml(m.code, {
          lang: m.lang,
          theme: "github-dark-default",
          transformers: [transformerNotationHighlight()],
          meta: m.meta ? { __raw: m.meta } : undefined,
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
        // Unknown language — leave the block untouched (plain <pre>)
      }
    }
  };
};

export default rehypeShiki;
