import { Suspense } from "react";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { allWriteups } from "@/.content-collections/generated";
import { PageHero } from "@/components/ui/PageHero";
import { Container } from "@/components/ui/Container";
import { WriteupsGrid } from "@/components/writeup/WriteupsGrid";
import { WriteupsExplorer } from "@/components/writeup/WriteupsExplorer";
import { pageMetadata } from "@/lib/metadata";

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
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "writeups" });
  const nav = await getTranslations({ locale, namespace: "nav" });

  const years = [...new Set(allWriteups.map((w) => w.year))].sort(
    (a, b) => b - a,
  );

  // Fully static export: render every writeup server-side (default: newest
  // first); `WriteupsExplorer` filters + sorts client-side from the URL.
  const writeups = [...allWriteups].sort((a, b) =>
    String(b.date).localeCompare(String(a.date)),
  );

  return (
    <>
      <PageHero
        index="01"
        eyebrow={nav("writeups")}
        title={t("title")}
        subtitle={t("subtitle")}
      />

      <Container>
        <Suspense
          fallback={
            <>
              <div className="mb-12 h-28 animate-pulse border border-line bg-bg2" />
              <WriteupsGrid writeups={writeups} locale={locale} />
            </>
          }
        >
          <WriteupsExplorer
            writeups={writeups}
            years={years}
            locale={locale}
          />
        </Suspense>
      </Container>
    </>
  );
}
