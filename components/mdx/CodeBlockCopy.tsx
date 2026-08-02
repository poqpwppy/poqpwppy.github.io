"use client";

import { useEffect } from "react";

/**
 * Hydrates the copy buttons injected by the Shiki rehype plugin
 * (`.codeblock-copy` with a base64 `data-code`). Runs an initial scan
 * and then watches for new nodes, because MDX content mounts and
 * unmounts on navigation.
 */
export function CodeBlockCopy() {
  useEffect(() => {
    function wire(btn: HTMLButtonElement) {
      if (btn.dataset.hydrated === "true") return;
      btn.dataset.hydrated = "true";

      btn.addEventListener("click", async () => {
        const code = btn.dataset.code;
        if (!code) return;
        try {
          const text = atob(code);
          await navigator.clipboard.writeText(text);
          btn.dataset.copied = "true";
          btn.textContent = "✓ copied";
          window.setTimeout(() => {
            btn.dataset.copied = "false";
            btn.textContent = "copy";
          }, 1800);
        } catch {
          btn.textContent = "error";
          window.setTimeout(() => {
            btn.textContent = "copy";
          }, 1200);
        }
      });
    }

    function scan() {
      document
        .querySelectorAll<HTMLButtonElement>(".codeblock-copy")
        .forEach(wire);
    }

    scan();
    const mo = new MutationObserver(() => scan());
    mo.observe(document.body, { childList: true, subtree: true });
    return () => mo.disconnect();
  }, []);

  return null;
}
