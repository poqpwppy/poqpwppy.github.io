"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { usePathname, useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { WRITEUP_CATEGORIES, WRITEUP_DIFFICULTIES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Search, X } from "@/components/icons";

type WriteupFiltersProps = {
  years: number[];
};

/**
 * URL-synced archive filters — search input, multi-select pills per
 * taxonomy, and a sort toggle. Every change rewrites the query string so
 * the server page re-renders the list (shareable, back-button friendly).
 */
export function WriteupFilters({ years }: WriteupFiltersProps) {
  const t = useTranslations("writeups");
  const tax = useTranslations("taxonomies");
  const common = useTranslations("common");
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const [draft, setDraft] = useState(() => searchParams?.get("q") ?? "");
  const [committed, setCommitted] = useState(false);

  // Keep draft in sync when the URL changes externally (back / lang switch).
  useEffect(() => {
    const q = searchParams?.get("q") ?? "";
    if (q !== draft) setDraft(q);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  function commit(sp: URLSearchParams) {
    const qs = sp.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  function updateParam(key: string, value: string) {
    const sp = new URLSearchParams(searchParams?.toString() ?? "");
    const existing = sp.getAll(key);
    if (existing.includes(value)) {
      const next = existing.filter((v) => v !== value);
      sp.delete(key);
      next.forEach((v) => sp.append(key, v));
    } else {
      sp.append(key, value);
    }
    commit(sp);
  }

  function setSingle(key: string, value: string) {
    const sp = new URLSearchParams(searchParams?.toString() ?? "");
    if (sp.get(key) === value) sp.delete(key);
    else sp.set(key, value);
    commit(sp);
  }

  function clearAll() {
    router.replace(pathname, { scroll: false });
  }

  // Debounced search → URL
  useEffect(() => {
    if (!committed) {
      setCommitted(true);
      return;
    }
    const id = setTimeout(() => {
      const sp = new URLSearchParams(searchParams?.toString() ?? "");
      if (draft) sp.set("q", draft);
      else sp.delete("q");
      commit(sp);
    }, 300);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft]);

  const activeCategory = searchParams?.getAll("category") ?? [];
  const activeDifficulty = searchParams?.getAll("difficulty") ?? [];
  const activeYear = searchParams?.get("year") ?? "";
  const sort = searchParams?.get("sort") ?? "newest";

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
          "relative cursor-pointer border px-3 py-1.5 font-mono text-[0.7rem] uppercase tracking-widest transition-all duration-300 backdrop-blur-md shadow-sm",
          active
            ? "border-[#e60026] bg-[#e60026] text-white shadow-[0_0_12px_rgba(230,0,38,0.7)] font-black"
            : "border-neutral-800 bg-black/60 text-neutral-400 hover:border-[#e60026] hover:text-white"
        )}
      >
        [{children}]
      </button>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search + sort + clear */}
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
            className="w-full border border-neutral-800 bg-black/60 py-2.5 pl-9 pr-3 font-mono text-xs uppercase tracking-wider text-white placeholder:text-neutral-500 focus:border-[#e60026] focus:shadow-[0_0_12px_rgba(230,0,38,0.5)] focus:outline-none backdrop-blur-md transition-all"
          />
        </div>

        <div
          role="group"
          aria-label={t("sortNewest")}
          className="flex overflow-hidden border border-neutral-800 rounded-md backdrop-blur-md"
        >
          {(["newest", "oldest"] as const).map((s) => (
            <button
              key={s}
              type="button"
              aria-pressed={sort === s}
              onClick={() => setSingle("sort", s)}
              className={cn(
                "cursor-pointer px-3.5 py-2.5 font-mono text-[0.7rem] font-bold uppercase tracking-widest transition-all",
                sort === s
                  ? "bg-[#e60026] text-white shadow-[0_0_12px_rgba(230,0,38,0.7)]"
                  : "bg-black/60 text-neutral-400 hover:text-white",
              )}
            >
              {s === "newest" ? t("sortNewest") : t("sortOldest")}
            </button>
          ))}
        </div>

        {activeCategory.length > 0 ||
        activeDifficulty.length > 0 ||
        activeYear ||
        draft ? (
          <button
            type="button"
            onClick={clearAll}
            className="inline-flex cursor-pointer items-center gap-1.5 font-mono text-[0.7rem] uppercase tracking-[0.08em] text-fg3 transition-colors hover:text-err"
          >
            <X className="text-[0.95em]" aria-hidden />
            {t("clearFilters")}
          </button>
        ) : null}
      </div>

      {/* Taxonomy pills */}
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
        <FilterGroup label={t("filterCategory")}>
          {WRITEUP_CATEGORIES.map((c) => (
            <Pill
              key={c}
              active={activeCategory.includes(c)}
              onClick={() => updateParam("category", c)}
            >
              {tax(`category.${c}`)}
            </Pill>
          ))}
        </FilterGroup>

        <FilterGroup label={t("filterDifficulty")}>
          {WRITEUP_DIFFICULTIES.map((d) => (
            <Pill
              key={d}
              active={activeDifficulty.includes(d)}
              onClick={() => updateParam("difficulty", d)}
            >
              {tax(`difficulty.${d}`)}
            </Pill>
          ))}
        </FilterGroup>

        {years.length > 0 ? (
          <FilterGroup label={t("filterYear")}>
            {years.map((y) => (
              <Pill
                key={y}
                active={activeYear === String(y)}
                onClick={() => setSingle("year", String(y))}
              >
                {y}
              </Pill>
            ))}
          </FilterGroup>
        ) : null}

        <span className="sr-only">{common("resultCount", { count: 0 })}</span>
      </div>
    </div>
  );
}

function FilterGroup({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="eyebrow shrink-0 !text-[0.6rem]">{label}</span>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  );
}
