import { Suspense } from "react";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { allResearch } from "@/.content-collections/generated";
import { PageHero } from "@/components/ui/PageHero";
import { Container } from "@/components/ui/Container";
import { AnimatedSection } from "@/components/ui/AnimatedSection";
import { ResearchCard } from "@/components/research/ResearchCard";
import { ResearchFilters } from "@/components/research/ResearchFilters";
import { StaggeredGrid, StaggeredItem } from "@/components/ui/StaggeredGrid";
import { pageMetadata } from "@/lib/metadata";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return pageMetadata(locale, "research");
}

export default async function ResearchPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "research" });
  const nav = await getTranslations({ locale, namespace: "nav" });
  const sp = await searchParams;
  const category = typeof sp.category === "string" ? sp.category : "";

  const items = [...allResearch]
    .filter((r) => !category || r.category === category)
    .sort((a, b) => String(b.date).localeCompare(String(a.date)));

  return (
    <>
      <PageHero
        index="02"
        eyebrow={nav("research")}
        title={t("title")}
        subtitle={t("subtitle")}
      />

      <Container className="pb-24">
        <AnimatedSection className="mb-10 flex flex-wrap items-center justify-between gap-4 border-b border-neutral-800 pb-6">
          <Suspense fallback={<div className="h-8" />}>
            <ResearchFilters />
          </Suspense>
          <p className="font-mono text-[0.7rem] uppercase tracking-[0.14em] text-neutral-500">
            TOTAL: {items.length.toString().padStart(2, "0")}
          </p>
        </AnimatedSection>

        {/* Research Grid */}
        <StaggeredGrid className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {items.map((r, i) => (
            <StaggeredItem key={r._meta.path} className="h-full">
              <ResearchCard research={r} locale={locale} index={i + 1} className="h-full" />
            </StaggeredItem>
          ))}
        </StaggeredGrid>

        {items.length === 0 ? (
          <div className="border border-neutral-800 bg-neutral-950 px-6 py-16 text-center">
            <p className="font-mono text-sm text-neutral-500">{t("empty")}</p>
          </div>
        ) : null}
      </Container>
    </>
  );
}
