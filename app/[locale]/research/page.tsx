import { Suspense } from "react";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { allResearch } from "@/.content-collections/generated";
import { PageHero } from "@/components/ui/PageHero";
import { Container } from "@/components/ui/Container";
import { ResearchGrid } from "@/components/research/ResearchGrid";
import { ResearchExplorer } from "@/components/research/ResearchExplorer";
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
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "research" });
  const nav = await getTranslations({ locale, namespace: "nav" });

  // Fully static export: render every item server-side; `ResearchExplorer`
  // filters the timeline client-side from the URL query string.
  const items = [...allResearch].sort((a, b) =>
    String(b.date).localeCompare(String(a.date)),
  );

  return (
    <>
      <PageHero
        index="02"
        eyebrow={nav("research")}
        title={t("title")}
        subtitle={t("subtitle")}
      />

      <Container className="pb-24">
        <Suspense
          fallback={
            <>
              <div className="mb-10 flex h-8 items-center justify-between gap-4 border-b border-neutral-800 pb-6">
                <div />
                <p className="font-mono text-[0.7rem] uppercase tracking-[0.14em] text-neutral-500">
                  TOTAL: {items.length.toString().padStart(2, "0")}
                </p>
              </div>
              <ResearchGrid items={items} locale={locale} />
            </>
          }
        >
          <ResearchExplorer items={items} locale={locale} />
        </Suspense>
      </Container>
    </>
  );
}
