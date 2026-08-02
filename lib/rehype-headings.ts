import type { Element, ElementContent, Root } from "hast";
import type { Plugin } from "unified";
import { visit } from "unist-util-visit";
import type { TocItem } from "./mdx";

function getNodeText(node: ElementContent): string {
  if (node.type === "text") return node.value;
  if (node.type === "element" && node.children) {
    return node.children.map(getNodeText).join("");
  }
  return "";
}

/**
 * Rehype plugin that collects heading hierarchy into a target array recursively.
 */
export function rehypeCollectHeadings(target: TocItem[]): Plugin<[], Root> {
  return () => (tree: Root) => {
    visit(tree, "element", (node: Element) => {
      if (/^h[1-4]$/.test(node.tagName)) {
        const id = String(node.properties?.id ?? "");
        const text = node.children.map(getNodeText).join(" ").replace(/\s+/g, " ").trim();
        if (text) {
          target.push({
            id: id || text.toLowerCase().replace(/[^\w]+/g, "-"),
            text,
            depth: Number(node.tagName[1]),
          });
        }
      }
    });
  };
}
