"use client";

import type { Tool } from "@/.content-collections/generated";
import { useTranslations } from "next-intl";
import { ToolCard } from "@/components/tools/ToolCard";
import { StaggeredGrid, StaggeredItem } from "@/components/ui/StaggeredGrid";

/**
 * Tool list body — count header + grid (or empty state) for an already
 * filtered array. Shared between the static Suspense fallback (all tools)
 * and the client-side filter view.
 */
export function ToolsGrid({
  tools,
  locale,
}: {
  tools: Tool[];
  locale: string;
}) {
  const t = useTranslations("tools");

  return (
    <>
      <div className="mb-6 flex items-baseline justify-between border-b border-line pb-4">
        <p className="font-mono text-[0.7rem] uppercase tracking-[0.14em] text-fg3">
          {tools.length.toString().padStart(2, "0")}
        </p>
        <p className="font-mono text-[0.7rem] text-fg3">{t("maintained")}</p>
      </div>

      {tools.length > 0 ? (
        <StaggeredGrid className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {tools.map((tool) => (
            <StaggeredItem key={tool.name} className="h-full">
              <ToolCard tool={tool} locale={locale} className="h-full" />
            </StaggeredItem>
          ))}
        </StaggeredGrid>
      ) : (
        <div className="border border-line bg-bg2 px-6 py-16 text-center">
          <p className="font-mono text-sm text-fg3">{t("allCategories")}</p>
        </div>
      )}
    </>
  );
}
