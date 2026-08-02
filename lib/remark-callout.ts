import type { Root } from "mdast";
import type { Plugin } from "unified";
import { visit } from "unist-util-visit";

const CALLOUTS: Record<string, string> = {
  NOTE: "note",
  WARNING: "warning",
  TIP: "tip",
  DANGER: "danger",
  INFO: "info",
};

/**
 * Converts GitHub-flavored callouts (`> [!NOTE]`) into
 * `<blockquote class="callout callout-note">` for styling.
 */
const remarkCallout: Plugin<[], Root> = () => (tree: Root) => {
  visit(tree, "blockquote", (node, index, parent) => {
    if (index === undefined || !parent) return;
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
      hProperties: { className: ["callout", `callout-${type}`] },
    };
  });
};

export default remarkCallout;
