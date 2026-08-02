"use client";

import { useTranslations } from "next-intl";
import type { Writeup } from "@/.content-collections/generated";
import { cn, formatDate } from "@/lib/utils";
import { DIFFICULTY_COLORS } from "@/lib/constants";
import { ArrowUpRight, Clock } from "@/components/icons";
import { MotionLink } from "@/components/writeup/MotionLink";

type WriteupCardProps = {
  writeup: Writeup;
  locale: string;
  /** Editorial index (01, 02…) shown in the gutter. */
  index?: number;
  className?: string;
  compact?: boolean;
};

/**
 * Editorial index card for a writeup — number gutter, meta row, title,
 * description and a hover arrow. Rendered on home + archive.
 */
export function WriteupCard({
  writeup,
  locale,
  index,
  className,
  compact,
}: WriteupCardProps) {
  const tax = useTranslations("taxonomies");
  const common = useTranslations("common");

  const href = `/writeups/${writeup._meta.path}`;
  const difficultyColor = DIFFICULTY_COLORS[writeup.difficulty];

  return (
    <MotionLink
      href={href}
      className={cn(
        "group relative grid grid-cols-[auto_1fr] gap-x-5 gap-y-3 border border-[#e60026]/35 bg-[#0a0a0d]/95 px-5 py-5 transition-all duration-500 backdrop-blur-xl shadow-[0_0_20px_rgba(230,0,38,0.15)] hover:border-[#e60026] hover:bg-[#120407]/95 hover:shadow-[0_0_35px_rgba(230,0,38,0.4)] transform-gpu sm:px-6 md:grid-cols-[3.5rem_1fr_auto] md:items-start md:gap-x-7",
        compact ? "py-4" : "py-6",
        className,
      )}
      whileHover={{ scale: 1.02, rotateY: 2, boxShadow: "0 0 25px rgba(230,0,38,0.5)" }}
    >
      {/* HUD Top-Left Corner Bracket */}
      <span
        aria-hidden
        className="absolute left-0 top-0 h-2 w-2 border-l-2 border-t-2 border-transparent transition-all duration-300 group-hover:border-[#e60026] group-hover:shadow-[0_0_8px_#e60026]"
      />

      {/* HUD Bottom-Right Corner Bracket */}
      <span
        aria-hidden
        className="absolute bottom-0 right-0 h-2 w-2 border-b-2 border-r-2 border-transparent transition-all duration-300 group-hover:border-[#e60026] group-hover:shadow-[0_0_8px_#e60026]"
      />

      {/* Index gutter */}
      {index !== undefined ? (
        <span
          aria-hidden
          className="font-mono text-xs font-black uppercase text-neutral-400 transition-colors group-hover:text-[#e60026] mt-1.5 hidden select-none md:block"
        >
          [{String(index).padStart(2, "0")}]
        </span>
      ) : null}

      {/* Body */}
      <div className="col-span-2 md:col-span-1">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
          <span className="font-mono text-[0.72rem] font-bold uppercase tracking-[0.1em] text-[#ff2a4b]">
            {tax(`category.${writeup.category}`)}
          </span>
          <span aria-hidden className="h-px w-4 bg-neutral-700" />
          <span className="inline-flex items-center gap-1.5 font-mono text-[0.72rem] uppercase tracking-[0.1em]">
            <span
              aria-hidden
              className="h-1.5 w-1.5 rounded-full"
              style={{
                background: difficultyColor,
                boxShadow: `0 0 8px ${difficultyColor}`,
              }}
            />
            <span style={{ color: difficultyColor }} className="font-bold">
              {tax(`difficulty.${writeup.difficulty}`)}
            </span>
          </span>
          {writeup.ctfName ? (
            <>
              <span aria-hidden className="h-px w-4 bg-neutral-700" />
              <span className="font-mono text-[0.72rem] uppercase tracking-[0.1em] text-neutral-300">
                {writeup.ctfName}
              </span>
            </>
          ) : null}
        </div>

        <h3 className="font-mono mt-3 text-lg font-black leading-snug tracking-tight text-white transition-colors group-hover:text-[#ff2a4b] md:text-xl">
          {writeup.title}
        </h3>

        {writeup.description && !compact ? (
          <p className="mt-2 line-clamp-2 text-pretty text-sm leading-relaxed text-zinc-300 font-mono">
            {writeup.description}
          </p>
        ) : null}

        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 font-mono text-[0.72rem] text-neutral-500">
          <span className="inline-flex items-center gap-1.5">
            <Clock className="text-[0.95em] opacity-70" aria-hidden />
            {formatDate(writeup.date, locale)}
          </span>
          <span aria-hidden className="h-px w-3 bg-neutral-800" />
          <span className="font-mono">
            {common("minRead", { count: writeup.readingTime })}
          </span>
          {(writeup.tags ?? []).length > 0 && !compact ? (
            <>
              <span aria-hidden className="h-px w-3 bg-neutral-800" />
              <span className="font-mono">
                {(writeup.tags ?? []).slice(0, 3).map((tag) => (
                  <span key={tag} className="after:content-['/'] after:px-1 after:text-neutral-600 last:after:content-['']">
                    #{tag}
                  </span>
                ))}
              </span>
            </>
          ) : null}
        </div>
      </div>

      {/* Arrow */}
      <span
        aria-hidden
        className="absolute right-5 top-5 hidden text-neutral-600 opacity-0 transition-all duration-300 group-hover:translate-x-1 group-hover:text-[#e60026] group-hover:opacity-100 md:block md:text-xl"
      >
        <ArrowUpRight />
      </span>
    </MotionLink>
  );
}
