"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { usePathname, useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { TOOL_CATEGORIES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Search, X } from "@/components/icons";

/** URL-synced tool filters — search + category pills. */
export function ToolFilters() {
  const t = useTranslations("tools");
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const [draft, setDraft] = useState(() => searchParams?.get("q") ?? "");
  const active = searchParams?.get("category") ?? "";

  useEffect(() => {
    const q = searchParams?.get("q") ?? "";
    if (q !== draft) setDraft(q);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  function commit(sp: URLSearchParams) {
    const qs = sp.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  function select(cat: string) {
    const sp = new URLSearchParams(searchParams?.toString() ?? "");
    if (active === cat) sp.delete("category");
    else sp.set("category", cat);
    commit(sp);
  }

  useEffect(() => {
    const id = setTimeout(() => {
      const sp = new URLSearchParams(searchParams?.toString() ?? "");
      if (draft) sp.set("q", draft);
      else sp.delete("q");
      commit(sp);
    }, 300);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[220px] flex-1">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-fg3"
            aria-hidden
          />
          <input
            type="search"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={t("searchPlaceholder")}
            aria-label={t("searchPlaceholder")}
            className="w-full border border-line bg-bg2 py-2.5 pl-9 pr-3 font-mono text-sm text-fg placeholder:text-fg3 focus:border-accent focus:outline-none"
          />
        </div>
        {(draft || active) ? (
          <button
            type="button"
            onClick={() => router.replace(pathname, { scroll: false })}
            className="inline-flex cursor-pointer items-center gap-1.5 font-mono text-[0.7rem] uppercase tracking-[0.08em] text-fg3 transition-colors hover:text-err"
          >
            <X className="text-[0.95em]" aria-hidden />
            {t("allCategories")}
          </button>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="eyebrow !text-[0.6rem]">{t("filterCategory")}</span>
        <Pill active={!active} onClick={() => select("")}>
          {t("allCategories")}
        </Pill>
        {TOOL_CATEGORIES.map((c) => (
          <Pill key={c} active={active === c} onClick={() => select(c)}>
            {c.replace(/-/g, " ")}
          </Pill>
        ))}
      </div>
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
