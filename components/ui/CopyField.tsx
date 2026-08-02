"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Check, Copy } from "@/components/icons";

/** Copy-to-clipboard button with transient "copied" state. */
export function CopyField({ text, label }: { text: string; label?: string }) {
  const t = useTranslations("common");
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={label}
      className="inline-flex cursor-pointer items-center gap-1.5 border border-line bg-bg2 px-2.5 py-1.5 font-mono text-[0.68rem] uppercase tracking-[0.08em] text-fg3 transition-colors hover:border-accent hover:text-accent"
    >
      {copied ? <Check className="text-[0.9em] text-mint" aria-hidden /> : <Copy className="text-[0.9em]" aria-hidden />}
      {copied ? t("copied") : t("copy")}
    </button>
  );
}
