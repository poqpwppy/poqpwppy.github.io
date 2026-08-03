import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { allWriteups } from "@/.content-collections/generated";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { ReadingProgress } from "@/components/ui/ReadingProgress";
import { TocSidebar } from "@/components/mdx/TocSidebar";
import { MobileTocCapsule } from "@/components/mdx/MobileTocCapsule";
import { MDX } from "@/components/mdx/MDX";
import { CodeBlockCopy } from "@/components/mdx/CodeBlockCopy";
import { WriteupCard } from "@/components/writeup/WriteupCard";
import { Badge } from "@/components/ui/Badge";
import { AnimatedSection } from "@/components/ui/AnimatedSection";
import { BackButton } from "@/components/ui/BackButton";
import { formatDate } from "@/lib/utils";
import { DIFFICULTY_COLORS } from "@/lib/constants";
import { JsonLd } from "@/components/ui/JsonLd";
import { profile } from "@/lib/profile";
import { Calendar, Clock } from "@/components/icons";
import { AsciiBackground } from "@/components/ascii/AsciiBackground";

type Params = { locale: string; slug: string };

export function generateStaticParams(): { slug: string }[] {
  return allWriteups.map((w) => ({ slug: w._meta.path }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const writeup = allWriteups.find((w) => w._meta.path === slug);
  if (!writeup) return {};
  return {
    title: writeup.title,
    description: writeup.description,
    openGraph: {
      title: writeup.title,
      description: writeup.description,
      type: "article",
      publishedTime: writeup.date,
      tags: writeup.tags,
    },
  };
}

export default async function WriteupPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const writeup = allWriteups.find((w) => w._meta.path === slug);
  if (!writeup) notFound();

  const t = await getTranslations({ locale, namespace: "writeups" });
  const tax = await getTranslations({ locale, namespace: "taxonomies" });
  const common = await getTranslations({ locale, namespace: "common" });

  const title = writeup.title;
  const difficultyColor = DIFFICULTY_COLORS[writeup.difficulty];

  const related = allWriteups
    .filter((w) => w._meta.path !== slug && w.category === writeup.category)
    .sort((a, b) => String(b.date).localeCompare(String(a.date)))
    .slice(0, 3);

  const site = process.env.NEXT_PUBLIC_SITE_URL ?? "https://poqpwppy.dev";

  return (
    <>
      <CodeBlockCopy />
      <BackButton fallback="/writeups" />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "TechArticle",
          headline: title,
          description: writeup.description,
          datePublished: writeup.date,
          inLanguage: locale,
          keywords: writeup.tags.join(", "),
          author: {
            "@type": "Person",
            name: profile.name,
            url: site,
          },
          mainEntityOfPage: {
            "@type": "WebPage",
            "@id": `${site}/writeups/${writeup._meta.path}`,
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
                {tax(`category.${writeup.category}`)}
              </span>
              <span aria-hidden className="h-px w-4 bg-neutral-700" />
              <span
                className="inline-flex items-center gap-1.5 font-mono text-xs font-extrabold uppercase tracking-[0.14em]"
                style={{ color: difficultyColor }}
              >
                <span
                  aria-hidden
                  className="h-2 w-2 rounded-full"
                  style={{ background: difficultyColor, boxShadow: `0 0 8px ${difficultyColor}` }}
                />
                {tax(`difficulty.${writeup.difficulty}`)}
              </span>
              {writeup.ctfName ? (
                <>
                  <span aria-hidden className="h-px w-4 bg-neutral-700" />
                  <span className="font-mono text-xs uppercase tracking-[0.14em] text-neutral-300">
                    {writeup.ctfName}
                    {writeup.ctfYear ? ` ${writeup.ctfYear}` : ""}
                  </span>
                </>
              ) : null}
            </div>

            <h1 className="font-mono mt-5 max-w-4xl text-balance text-3xl font-black uppercase tracking-tight text-white sm:text-4xl md:text-5xl md:leading-tight">
              {title}
            </h1>

            {writeup.description ? (
              <p className="mt-4 max-w-2xl font-mono text-sm leading-relaxed text-zinc-300 md:text-base">
                {writeup.description}
              </p>
            ) : null}

            <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-xs text-neutral-400">
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="text-[0.95em] text-[#ff2a4b]" aria-hidden />
                {formatDate(writeup.date, locale)}
              </span>
              <span aria-hidden className="h-px w-3 bg-neutral-700" />
              <span className="inline-flex items-center gap-1.5">
                <Clock className="text-[0.95em] text-[#ff2a4b]" aria-hidden />
                {common("minRead", { count: writeup.readingTime })}
              </span>
            </div>

            {(writeup.categories ?? []).length > 0 ? (
              <div className="mt-6 flex flex-wrap gap-2">
                {writeup.categories.map((c) => (
                  <Badge key={c} tone="neutral" className="font-mono text-xs bg-[#141419] border border-neutral-700 text-neutral-200">
                    {c}
                  </Badge>
                ))}
              </div>
            ) : null}

            {(writeup.tags ?? []).length > 0 ? (
              <div className="mt-4 flex flex-wrap gap-2">
                {writeup.tags.map((tag) => (
                  <Badge key={tag} href={`/tags/${tag}`} tone="neutral" className="font-mono text-xs bg-[#141419] border border-neutral-700 text-neutral-200 hover:border-[#e60026] hover:text-white">
                    #{tag}
                  </Badge>
                ))}
              </div>
            ) : null}

            {locale === "en" ? (
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
              <MDX code={writeup.html} />
            </div>

            {/* TOC sidebar */}
            <aside className="hidden lg:block">
              <TocSidebar toc={writeup.toc ?? []} label={t("toc")} />
            </aside>
          </div>
          <MobileTocCapsule toc={writeup.toc ?? []} label={t("toc")} />
        </AnimatedSection>
      </Container>

      {/* ── Related writeups ── */}
      {related.length > 0 ? (
        <Container id="related-posts" className="relative z-10 pb-24 pt-4">
          <AnimatedSection className="border-t border-[#e60026]/20 pt-10" delay={0.05}>
            <p className="eyebrow mb-6 flex items-center gap-2.5">
              <span aria-hidden className="h-px w-5 bg-accent/60" />
              {t("related")}
            </p>
            <div className="flex flex-col gap-4">
              {related.map((w, i) => (
                <WriteupCard
                  key={w._meta.path}
                  writeup={w}
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
