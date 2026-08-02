import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import type { Writeup } from "@/.content-collections/generated";
import { cn, formatDate } from "@/lib/utils";
import { DIFFICULTY_COLORS } from "@/lib/constants";
import { ArrowUpRight, Clock } from "@/components/icons";

export async function FeaturedWriteup({
  writeup,
  locale,
  label,
  className,
}: {
  writeup: Writeup;
  locale: string;
  label?: string;
  className?: string;
}) {
  const tax = await getTranslations({ locale, namespace: "taxonomies" });
  const common = await getTranslations({ locale, namespace: "common" });
  const href = `/writeups/${writeup._meta.path}`;
  const difficultyColor = DIFFICULTY_COLORS[writeup.difficulty];

  return (
    <Link
      href={href}
      data-hud-label="FEATURED"
      className={cn(
        "group relative flex flex-col justify-between overflow-hidden border border-neutral-800 bg-black p-8 transition-all duration-300 hover:border-[white] hover:shadow-[0_0_40px_rgba(255,255,255,0.1)] md:p-10",
        className,
      )}
    >
      {/* Animated top border on hover */}
      <span
        aria-hidden
        className="absolute left-0 top-0 h-0.5 w-0 bg-[white] transition-all duration-500 ease-out group-hover:w-full"
      />

      {/* Header meta */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="font-mono text-[0.68rem] uppercase tracking-[0.22em] text-[white] font-bold">
          {label}
        </span>
        <span className="font-mono text-[0.68rem] uppercase tracking-[0.1em] text-neutral-500">
          {formatDate(writeup.date, locale)}
        </span>
      </div>

      {/* Title */}
      <h3 className="mt-6 text-balance font-sans text-3xl font-black uppercase leading-[1.02] tracking-tight text-white transition-colors group-hover:text-[white] sm:text-4xl md:text-5xl">
        {writeup.title}
      </h3>

      {/* Description */}
      {writeup.description && (
        <p className="mt-4 line-clamp-3 max-w-2xl text-pretty text-sm leading-relaxed text-neutral-400 md:text-base">
          {writeup.description}
        </p>
      )}

      {/* Tags row */}
      <div className="mt-8 flex flex-wrap items-center gap-x-4 gap-y-2 font-mono text-[0.7rem] text-neutral-500">
        <span className="uppercase tracking-widest text-neutral-300">
          {tax(`category.${writeup.category}`)}
        </span>
        <span aria-hidden className="h-px w-3 bg-neutral-700" />
        <span className="uppercase tracking-widest" style={{ color: difficultyColor }}>
          {tax(`difficulty.${writeup.difficulty}`)}
        </span>
        {writeup.ctfName && (
          <>
            <span aria-hidden className="h-px w-3 bg-neutral-700" />
            <span className="uppercase tracking-widest">{writeup.ctfName}</span>
          </>
        )}
        <span aria-hidden className="h-px w-3 bg-neutral-700" />
        <span className="inline-flex items-center gap-1.5">
          <Clock className="text-[0.9em] opacity-60" aria-hidden />
          {common("minRead", { count: writeup.readingTime })}
        </span>
        {(writeup.tags ?? []).length > 0 && (
          <>
            <span aria-hidden className="h-px w-3 bg-neutral-700" />
            <span>{(writeup.tags ?? []).slice(0, 3).join(" · ")}</span>
          </>
        )}
      </div>

      {/* Arrow */}
      <span
        aria-hidden
        className="absolute bottom-8 right-8 text-xl text-neutral-600 transition-all duration-300 group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:text-[white]"
      >
        <ArrowUpRight />
      </span>
    </Link>
  );
}
