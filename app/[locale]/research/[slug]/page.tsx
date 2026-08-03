import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { allResearch } from "@/.content-collections/generated";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { TocSidebar } from "@/components/mdx/TocSidebar";
import { MobileTocCapsule } from "@/components/mdx/MobileTocCapsule";
import { MDX } from "@/components/mdx/MDX";
import { CodeBlockCopy } from "@/components/mdx/CodeBlockCopy";
import { ResearchCard } from "@/components/research/ResearchCard";
import { Badge } from "@/components/ui/Badge";
import { AnimatedSection } from "@/components/ui/AnimatedSection";
import { BackButton } from "@/components/ui/BackButton";
import { JsonLd } from "@/components/ui/JsonLd";
import { formatDate } from "@/lib/utils";
import { profile } from "@/lib/profile";
import { Calendar, Clock } from "@/components/icons";

type Params = { locale: string; slug: string };

export function generateStaticParams(): { slug: string }[] {
  return allResearch.map((r) => ({ slug: r._meta.path }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const r = allResearch.find((x) => x._meta.path === slug);
  if (!r) return {};
  return {
    title: r.title,
    description: r.summary,
    openGraph: {
      title: r.title,
      description: r.summary,
      type: "article",
      publishedTime: r.date,
      tags: r.tags,
    },
  };
}

export default async function ResearchDetailPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const research = allResearch.find((x) => x._meta.path === slug);
  if (!research) notFound();

  const t = await getTranslations({ locale, namespace: "research" });
  const tax = await getTranslations({ locale, namespace: "taxonomies" });
  const common = await getTranslations({ locale, namespace: "common" });

  const title = research.title;

  const related = allResearch
    .filter(
      (r) => r._meta.path !== slug && r.category === research.category,
    )
    .sort((a, b) => String(b.date).localeCompare(String(a.date)))
    .slice(0, 3);

  const site = process.env.NEXT_PUBLIC_SITE_URL ?? "https://poqpwppy.github.io";

  return (
    <>
      <CodeBlockCopy />
      <BackButton fallback="/research" />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "TechArticle",
          headline: title,
          description: research.summary,
          datePublished: research.date,
          dateModified: research.date,
          inLanguage: locale,
          keywords: research.tags.join(", "),
          author: {
            "@type": "Person",
            name: profile.name,
            url: site,
          },
          mainEntityOfPage: {
            "@type": "WebPage",
            "@id": `${site}/research/${research._meta.path}`,
          },
        }}
      />

      <Container className="relative z-10 pt-28 md:pt-36">
        {/* ── Header Card ── */}
        <AnimatedSection variant="fade" delay={0}>
          <header className="relative mt-2 border border-[#e60026]/40 bg-[#0a0a0d]/95 p-6 sm:p-10 backdrop-blur-xl shadow-[0_0_35px_rgba(230,0,38,0.18)] transition-all duration-500">
            {/* HUD corner brackets */}
            <span
              aria-hidden
              className="absolute left-0 top-0 h-4 w-4 border-l-2 border-t-2 border-[#e60026] shadow-[0_0_10px_#e60026]"
            />
            <span
              aria-hidden
              className="absolute bottom-0 right-0 h-4 w-4 border-b-2 border-r-2 border-[#e60026] shadow-[0_0_10px_#e60026]"
            />

            {/* Scanline sweep */}
            <span
              aria-hidden
              className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#e60026]/40 to-transparent animate-hud-scanline"
            />

            {/* Meta row */}
            <div className="flex flex-wrap items-center gap-3">
              <span className="font-mono text-xs font-black uppercase tracking-[0.14em] text-[#ff2a4b]">
                {tax(`researchCategory.${research.category}`)}
              </span>
              <span aria-hidden className="h-px w-4 bg-neutral-700" />
              <span className="inline-flex items-center gap-1.5 font-mono text-xs font-extrabold uppercase tracking-[0.14em] text-emerald-400">
                <span
                  aria-hidden
                  className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]"
                />
                {research.status === "published"
                  ? t("statusPublished")
                  : research.status === "wip"
                    ? t("statusWip")
                    : t("statusPrivate")}
              </span>
            </div>

            <h1 className="font-mono mt-5 max-w-4xl text-balance text-3xl font-black uppercase tracking-tight text-white sm:text-4xl md:text-5xl md:leading-tight">
              {title}
            </h1>

            {research.summary ? (
              <p className="mt-4 max-w-2xl font-mono text-sm leading-relaxed text-zinc-300 md:text-base">
                {research.summary}
              </p>
            ) : null}

            <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-xs text-neutral-400">
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="text-[0.95em] text-[#ff2a4b]" aria-hidden />
                {formatDate(research.date, locale)}
              </span>
              <span aria-hidden className="h-px w-3 bg-neutral-700" />
              <span className="inline-flex items-center gap-1.5">
                <Clock className="text-[0.95em] text-[#ff2a4b]" aria-hidden />
                {common("minRead", { count: research.readingTime })}
              </span>
            </div>

            {(research.categories ?? []).length > 0 ? (
              <div className="mt-6 flex flex-wrap gap-2">
                {research.categories.map((c) => (
                  <Badge key={c} tone="neutral" className="font-mono text-xs bg-[#141419] border border-neutral-700 text-neutral-200">
                    {c}
                  </Badge>
                ))}
              </div>
            ) : null}

            {(research.tags ?? []).length > 0 ? (
              <div className="mt-4 flex flex-wrap gap-2">
                {research.tags.map((tag) => (
                  <Badge key={tag} href={`/tags/${tag}`} tone="neutral" className="font-mono text-xs bg-[#141419] border border-neutral-700 text-neutral-200 hover:border-[#e60026] hover:text-white">
                    #{tag}
                  </Badge>
                ))}
              </div>
            ) : null}

            {locale === "en" && research.isVietnamese ? (
              <p className="mt-6 max-w-2xl border-l-4 border-[#e60026] bg-[#160508] px-4 py-3 font-mono text-xs leading-relaxed text-neutral-200">
                {common("languageNote")}
              </p>
            ) : null}
          </header>
        </AnimatedSection>

        {/* ── Body: article + TOC ── */}
        <AnimatedSection delay={0.1} variant="slide-up">
          <div className="grid grid-cols-1 gap-12 py-10 lg:grid-cols-[minmax(0,1fr)_16rem] lg:gap-16">
            {/* Article */}
            <div className="min-w-0 border-l border-[#e60026]/15 pl-0 lg:pl-1">
              <MDX code={research.html} />
            </div>

            {/* TOC sidebar */}
            <aside className="hidden lg:block">
              <TocSidebar toc={research.toc ?? []} label={t("toc")} />
            </aside>
          </div>
          <MobileTocCapsule toc={research.toc ?? []} label={t("toc")} />
        </AnimatedSection>
      </Container>

      {/* ── Related research ── */}
      {related.length > 0 ? (
        <Container id="related-posts" className="relative z-10 pb-24 pt-4">
          <AnimatedSection className="border-t border-[#e60026]/20 pt-10" delay={0.05}>
            <p className="eyebrow mb-6 flex items-center gap-2.5">
              <span aria-hidden className="h-px w-5 bg-accent/60" />
              {t("related")}
            </p>
            <div className="flex flex-col gap-4">
              {related.map((r, i) => (
                <ResearchCard
                  key={r._meta.path}
                  research={r}
                  locale={locale}
                  index={i + 1}
                />
              ))}
            </div>
          </AnimatedSection>
        </Container>
      ) : null}
    </>
  );
}

