import { Suspense } from "react";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { allTools } from "@/.content-collections/generated";
import { PageHero } from "@/components/ui/PageHero";
import { Container } from "@/components/ui/Container";
import { ToolsGrid } from "@/components/tools/ToolsGrid";
import { ToolsExplorer } from "@/components/tools/ToolsExplorer";
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
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "tools" });
  const nav = await getTranslations({ locale, namespace: "nav" });

  // Fully static export: render every tool server-side; `ToolsExplorer`
  // filters the list client-side from the URL query string.
  const tools = [...allTools].sort((a, b) => (b.stars ?? 0) - (a.stars ?? 0));

  return (
    <>
      <PageHero
        index="05"
        eyebrow={nav("tools")}
        title={t("title")}
        subtitle={t("subtitle")}
      />

      <Container>
        <Suspense
          fallback={
            <>
              <div className="mb-10 h-20" />
              <ToolsGrid tools={tools} locale={locale} />
            </>
          }
        >
          <ToolsExplorer tools={tools} locale={locale} />
        </Suspense>
      </Container>
    </>
  );
}
