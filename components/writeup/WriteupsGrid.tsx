"use client";

import type { Writeup } from "@/.content-collections/generated";
import { useTranslations } from "next-intl";
import { WriteupCard } from "@/components/writeup/WriteupCard";
import { StaggeredGrid, StaggeredItem } from "@/components/ui/StaggeredGrid";
import { buttonLinkClasses } from "@/components/ui/Button";
import { Search } from "@/components/icons";
import { Link } from "@/i18n/navigation";

/**
 * Writeup archive body — result count + list (or empty state) for an
 * already filtered array. Shared between the static Suspense fallback (all
 * writeups) and the client-side filter view.
 */
export function WriteupsGrid({
  writeups,
  locale,
  filtersActive = false,
}: {
  writeups: Writeup[];
  locale: string;
  filtersActive?: boolean;
}) {
  const t = useTranslations("writeups");
  const common = useTranslations("common");

  return (
    <>
      <div className="mb-6 flex items-baseline justify-between gap-4 border-b border-line pb-4">
        <p className="font-mono text-[0.7rem] uppercase tracking-[0.14em] text-fg3">
          {common("resultCount", { count: writeups.length })}
        </p>
        {filtersActive ? (
          <p className="font-mono text-[0.7rem] text-fg3">
            {common("showing")}{" "}
            <span className="text-accent">
              {writeups.length.toString().padStart(2, "0")}
            </span>
          </p>
        ) : null}
      </div>

      {writeups.length > 0 ? (
        <StaggeredGrid className="flex flex-col gap-4 pb-20">
          {writeups.map((w, i) => (
            <StaggeredItem key={w._meta.path}>
              <WriteupCard writeup={w} locale={locale} index={i + 1} />
            </StaggeredItem>
          ))}
        </StaggeredGrid>
      ) : (
        <div className="border border-line bg-bg2 px-6 py-16 text-center">
          <Search className="mx-auto text-3xl text-fg3" aria-hidden />
          <h2 className="font-display mt-4 text-xl font-bold text-fg">
            {t("emptyTitle")}
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-fg2">
            {t("emptyDesc")}
          </p>
          <Link
            href="/writeups"
            className={buttonLinkClasses({
              variant: "outline",
              size: "sm",
              className: "mt-6",
            })}
          >
            {common("reset")}
          </Link>
        </div>
      )}
    </>
  );
}
