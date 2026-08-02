
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { allWriteups, allResearch } from "@/.content-collections/generated";
import { PageHero } from "@/components/ui/PageHero";
import { Container } from "@/components/ui/Container";
import { AnimatedSection } from "@/components/ui/AnimatedSection";
import { TagContent } from "@/components/tags/TagContent";
import { WriteupCard } from "@/components/writeup/WriteupCard";
import { ResearchCard } from "@/components/research/ResearchCard";

function allTagNames() {
  return [
    ...new Set([
      ...allWriteups.flatMap((w) => w.tags ?? []),
      ...allResearch.flatMap((r) => r.tags ?? []),
    ]),
  ];
}

export function generateStaticParams(): { tag: string }[] {
  return allTagNames().map((tag) => ({ tag }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; tag: string }>;
}): Promise<Metadata> {
  const { locale, tag } = await params;
  const t = await getTranslations({ locale, namespace: "common" });
  return {
    title: `${t("tag")} #${tag}`,
    robots: { index: true, follow: true },
  };
}

export default async function TagPage({
  params,
}: {
  params: Promise<{ locale: string; tag: string }>;
}) {
  const { locale, tag } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "common" });
  const nav = await getTranslations({ locale, namespace: "nav" });

  const writeups = allWriteups
    .filter((w) => (w.tags ?? []).includes(tag))
    .sort((a, b) => String(b.date).localeCompare(String(a.date)));
  const research = allResearch
    .filter((r) => (r.tags ?? []).includes(tag))
    .sort((a, b) => String(b.date).localeCompare(String(a.date)));

  if (!writeups.length && !research.length) notFound();

  return (
    <>
      <PageHero
        eyebrow={t("tag")}
        title={`#${tag}`}
        subtitle={`${writeups.length + research.length} ${t("resultCount", {
          count: writeups.length + research.length,
        })}`}
      />

      <Container>
        {writeups.length > 0 ? (
          <AnimatedSection className="mb-12">
            <p className="eyebrow mb-5 flex items-center gap-2.5">
              <span aria-hidden className="h-px w-5 bg-accent/60" />
              {nav("writeups")}
            </p>
            <div className="flex flex-col gap-4">
              {writeups.map((w, i) => (
                <WriteupCard
                  key={w._meta.path}
                  writeup={w}
                  locale={locale}
                  index={i + 1}
                />
              ))}
            </div>
          </AnimatedSection>
        ) : null}

        {research.length > 0 ? (
          <AnimatedSection className="pb-24">
            <p className="eyebrow mb-5 flex items-center gap-2.5">
              <span aria-hidden className="h-px w-5 bg-accent/60" />
              {nav("research")}
            </p>
            <div className="flex flex-col gap-4">
              {research.map((r, i) => (
                <ResearchCard
                  key={r._meta.path}
                  research={r}
                  locale={locale}
                  index={i + 1}
                />
              ))}
            </div>
          </AnimatedSection>
        ) : null}
      </Container>
    </>
  );
}
