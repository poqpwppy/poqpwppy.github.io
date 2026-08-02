"use client";

import { useSearchParams } from "next/navigation";
import { usePathname, useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { RESEARCH_CATEGORIES } from "@/lib/constants";
import { cn } from "@/lib/utils";

/**
 * Category filter for the research timeline — single-select pills that
 * rewrite the `category` query param (server page re-renders).
 */
export function ResearchFilters() {
  const t = useTranslations("research");
  const tax = useTranslations("taxonomies");
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const active = searchParams?.get("category") ?? "";

  function select(cat: string) {
    const sp = new URLSearchParams(searchParams?.toString() ?? "");
    if (active === cat) sp.delete("category");
    else sp.set("category", cat);
    const qs = sp.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  return (
    <div className="flex flex-wrap gap-1.5" role="group" aria-label={t("filterAll")}>
      <Pill active={!active} onClick={() => select("")}>
        {t("filterAll")}
      </Pill>
      {RESEARCH_CATEGORIES.map((c) => (
        <Pill key={c} active={active === c} onClick={() => select(c)}>
          {tax(`researchCategory.${c}`)}
        </Pill>
      ))}
    </div>
  );
}

function Pill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "cursor-pointer border px-2.5 py-1.5 font-mono text-[0.7rem] tracking-wide transition-colors",
        active
          ? "border-accent bg-accent/10 text-accent"
          : "border-line bg-bg2 text-fg3 hover:border-line2 hover:text-fg2",
      )}
    >
      {children}
    </button>
  );
}
