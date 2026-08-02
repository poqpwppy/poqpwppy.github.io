"use client";

import type { Research } from "@/.content-collections/generated";
import { useTranslations } from "next-intl";
import { ResearchCard } from "@/components/research/ResearchCard";
import { StaggeredGrid, StaggeredItem } from "@/components/ui/StaggeredGrid";

/**
 * Research timeline grid — cards (or empty state) for an already filtered
 * array. Shared between the static Suspense fallback (all items) and the
 * client-side filter view.
 */
export function ResearchGrid({
  items,
  locale,
}: {
  items: Research[];
  locale: string;
}) {
  const t = useTranslations("research");

  return (
    <>
      <StaggeredGrid className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {items.map((r, i) => (
          <StaggeredItem key={r._meta.path} className="h-full">
            <ResearchCard
              research={r}
              locale={locale}
              index={i + 1}
              className="h-full"
            />
          </StaggeredItem>
        ))}
      </StaggeredGrid>

      {items.length === 0 ? (
        <div className="border border-neutral-800 bg-neutral-950 px-6 py-16 text-center">
          <p className="font-mono text-sm text-neutral-500">{t("empty")}</p>
        </div>
      ) : null}
    </>
  );
}
