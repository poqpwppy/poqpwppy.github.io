import { Suspense } from "react";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { allWriteups } from "@/.content-collections/generated";
import { PageHero } from "@/components/ui/PageHero";
import { Container } from "@/components/ui/Container";
import { AnimatedSection } from "@/components/ui/AnimatedSection";
import { WriteupCard } from "@/components/writeup/WriteupCard";
import { WriteupFilters } from "@/components/writeup/WriteupFilters";
import { StaggeredGrid, StaggeredItem } from "@/components/ui/StaggeredGrid";
import { buttonLinkClasses } from "@/components/ui/Button";
import { Search } from "@/components/icons";
import { Link } from "@/i18n/navigation";
import { pageMetadata } from "@/lib/metadata";
import { AsciiBackground } from "@/components/ascii/AsciiBackground";

function toArray(v: string | string[] | undefined): string[] {
  if (!v) return [];
  return Array.isArray(v) ? v : [v];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return pageMetadata(locale, "writeups");
}

export default async function WriteupsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "writeups" });
  const nav = await getTranslations({ locale, namespace: "nav" });
  const common = await getTranslations({ locale, namespace: "common" });
  const sp = await searchParams;

  const q = (typeof sp.q === "string" ? sp.q : "").trim().toLowerCase();
  const categories = toArray(sp.category);
  const difficulties = toArray(sp.difficulty);
  const year = typeof sp.year === "string" ? sp.year : "";
  const sort = sp.sort === "oldest" ? "oldest" : "newest";

  const years = [...new Set(allWriteups.map((w) => w.year))]
    .sort((a, b) => b - a);

  let list = [...allWriteups];

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

  const filtersActive =
    q !== "" || categories.length > 0 ||
    difficulties.length > 0 || year !== "";

  return (
    <>
      <PageHero
        index="01"
        eyebrow={nav("writeups")}
        title={t("title")}
        subtitle={t("subtitle")}
      />

      <Container>
        <AnimatedSection className="mb-12">
          <Suspense
            fallback={
              <div className="h-28 animate-pulse border border-line bg-bg2" />
            }
          >
            <WriteupFilters years={years} />
          </Suspense>
        </AnimatedSection>

        <div className="mb-6 flex items-baseline justify-between gap-4 border-b border-line pb-4">
          <p className="font-mono text-[0.7rem] uppercase tracking-[0.14em] text-fg3">
            {filtersActive
              ? common("resultCount", { count: list.length })
              : common("resultCount", { count: list.length })}
          </p>
          {filtersActive ? (
            <p className="font-mono text-[0.7rem] text-fg3">
              {common("showing")}{" "}
              <span className="text-accent">
                {list.length.toString().padStart(2, "0")}
              </span>
            </p>
          ) : null}
        </div>

        {list.length > 0 ? (
          <StaggeredGrid className="flex flex-col gap-4 pb-20">
            {list.map((w, i) => (
              <StaggeredItem key={w._meta.path}>
                <WriteupCard
                  writeup={w}
                  locale={locale}
                  index={i + 1}
                />
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
      </Container>
    </>
  );
}
