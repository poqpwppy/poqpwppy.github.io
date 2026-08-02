import { Suspense } from "react";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { allTools } from "@/.content-collections/generated";
import { PageHero } from "@/components/ui/PageHero";
import { Container } from "@/components/ui/Container";
import { AnimatedSection } from "@/components/ui/AnimatedSection";
import { ToolCard } from "@/components/tools/ToolCard";
import { ToolFilters } from "@/components/tools/ToolFilters";
import { StaggeredGrid, StaggeredItem } from "@/components/ui/StaggeredGrid";
import { pageMetadata } from "@/lib/metadata";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return pageMetadata(locale, "tools");
}
export default async function ToolsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "tools" });
  const nav = await getTranslations({ locale, namespace: "nav" });
  const sp = await searchParams;

  const q = (typeof sp.q === "string" ? sp.q : "").trim().toLowerCase();
  const category = typeof sp.category === "string" ? sp.category : "";

  const tools = [...allTools]
    .filter(
      (tool) =>
        (!category || tool.category === category) &&
        (!q ||
          [tool.name, tool.description, tool.language, ...(tool.tags ?? [])]
            .join(" ")
            .toLowerCase()
            .includes(q)),
    )
    .sort((a, b) => (b.stars ?? 0) - (a.stars ?? 0));

  return (
    <>
      <PageHero
        index="05"
        eyebrow={nav("tools")}
        title={t("title")}
        subtitle={t("subtitle")}
      />

      <Container>
        <AnimatedSection className="mb-10">
          <Suspense fallback={<div className="h-20" />}>
            <ToolFilters />
          </Suspense>
        </AnimatedSection>

        <div className="mb-6 flex items-baseline justify-between border-b border-line pb-4">
          <p className="font-mono text-[0.7rem] uppercase tracking-[0.14em] text-fg3">
            {tools.length.toString().padStart(2, "0")}
          </p>
          <p className="font-mono text-[0.7rem] text-fg3">
            {t("maintained")}
          </p>
        </div>

        {tools.length > 0 ? (
          <StaggeredGrid className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {tools.map((tool) => (
              <StaggeredItem key={tool.name} className="h-full">
                <ToolCard
                  tool={tool}
                  locale={locale}
                  className="h-full"
                />
              </StaggeredItem>
            ))}
          </StaggeredGrid>
        ) : (
          <div className="border border-line bg-bg2 px-6 py-16 text-center">
            <p className="font-mono text-sm text-fg3">{t("allCategories")}</p>
          </div>
        )}
      </Container>
    </>
  );
}
