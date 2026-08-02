"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import type { Writeup } from "@/.content-collections/generated";
import { AnimatedSection } from "@/components/ui/AnimatedSection";
import { WriteupFilters } from "@/components/writeup/WriteupFilters";
import { WriteupsGrid } from "@/components/writeup/WriteupsGrid";

function toArray(v: string | string[] | undefined): string[] {
  if (!v) return [];
  return Array.isArray(v) ? v : [v];
}

/**
 * Client-side filter + sort of the writeup archive, driven by the URL
 * (`?q=…&category=…&difficulty=…&year=…&sort=…`) that `<WriteupFilters />`
 * writes to. Must live inside a `<Suspense>` boundary (in the page) so it can
 * be prerendered statically for `output: "export"`.
 */
export function WriteupsExplorer({
  writeups,
  years,
  locale,
}: {
  writeups: Writeup[];
  years: number[];
  locale: string;
}) {
  const searchParams = useSearchParams();

  const q = (searchParams?.get("q") ?? "").trim().toLowerCase();
  const categories = toArray(searchParams?.getAll("category"));
  const difficulties = toArray(searchParams?.getAll("difficulty"));
  const year = searchParams?.get("year") ?? "";
  const sort = searchParams?.get("sort") === "oldest" ? "oldest" : "newest";

  const filtered = useMemo(() => {
    let list = [...writeups];

    if (q) {
      list = list.filter((w) =>
        [w.title, w.description ?? "", ...(w.tags ?? [])]
          .join(" ")
          .toLowerCase()
          .includes(q),
      );
    }
    if (categories.length) {
      list = list.filter((w) => categories.includes(w.category));
    }
    if (difficulties.length) {
      list = list.filter((w) => difficulties.includes(w.difficulty));
    }
    if (year) {
      list = list.filter((w) => w.year === Number(year));
    }

    list.sort((a, b) =>
      sort === "newest"
        ? String(b.date).localeCompare(String(a.date))
        : String(a.date).localeCompare(String(b.date)),
    );

    return list;
  }, [writeups, q, categories, difficulties, year, sort]);

  const filtersActive =
    q !== "" || categories.length > 0 || difficulties.length > 0 || year !== "";

  return (
    <>
      <AnimatedSection className="mb-12">
        <WriteupFilters years={years} />
      </AnimatedSection>

      <WriteupsGrid
        writeups={filtered}
        locale={locale}
        filtersActive={filtersActive}
      />
    </>
  );
}
