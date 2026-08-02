"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import type { Research } from "@/.content-collections/generated";
import { AnimatedSection } from "@/components/ui/AnimatedSection";
import { ResearchFilters } from "@/components/research/ResearchFilters";
import { ResearchGrid } from "@/components/research/ResearchGrid";

/**
 * Client-side filter of the research timeline, driven by the URL
 * (`?category=…`) that `<ResearchFilters />` writes to. Must live inside a
 * `<Suspense>` boundary (in the page) so it can be prerendered statically
 * for `output: "export"`.
 */
export function ResearchExplorer({
  items,
  locale,
}: {
  items: Research[];
  locale: string;
}) {
  const searchParams = useSearchParams();
  const category = searchParams?.get("category") ?? "";

  const filtered = useMemo(
    () => items.filter((r) => !category || r.category === category),
    [items, category],
  );

  return (
    <>
      <AnimatedSection className="mb-10 flex flex-wrap items-center justify-between gap-4 border-b border-neutral-800 pb-6">
        <ResearchFilters />
        <p className="font-mono text-[0.7rem] uppercase tracking-[0.14em] text-neutral-500">
          TOTAL: {filtered.length.toString().padStart(2, "0")}
        </p>
      </AnimatedSection>

      <ResearchGrid items={filtered} locale={locale} />
    </>
  );
}
