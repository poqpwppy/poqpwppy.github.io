"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import type { Tool } from "@/.content-collections/generated";
import { AnimatedSection } from "@/components/ui/AnimatedSection";
import { ToolFilters } from "@/components/tools/ToolFilters";
import { ToolsGrid } from "@/components/tools/ToolsGrid";

/**
 * Client-side filter of the tool grid, driven by the URL (`?q=…&category=…`)
 * that `<ToolFilters />` writes to. Must live inside a `<Suspense>` boundary
 * (in the page) so it can be prerendered statically for `output: "export"`.
 */
export function ToolsExplorer({
  tools,
  locale,
}: {
  tools: Tool[];
  locale: string;
}) {
  const searchParams = useSearchParams();

  const q = (searchParams?.get("q") ?? "").trim().toLowerCase();
  const category = searchParams?.get("category") ?? "";

  const filtered = useMemo(
    () =>
      tools.filter(
        (tool) =>
          (!category || tool.category === category) &&
          (!q ||
            [tool.name, tool.description, tool.language, ...(tool.tags ?? [])]
              .join(" ")
              .toLowerCase()
              .includes(q)),
      ),
    [tools, q, category],
  );

  return (
    <>
      <AnimatedSection className="mb-10">
        <ToolFilters />
      </AnimatedSection>

      <ToolsGrid tools={filtered} locale={locale} />
    </>
  );
}
