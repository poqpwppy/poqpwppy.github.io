import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import type { Research } from "@/.content-collections/generated";
import { cn, formatDate } from "@/lib/utils";

import { Clock } from "@/components/icons";


type ResearchCardProps = {
  research: Research;
  locale: string;
  index?: number;
  className?: string;
};

export async function ResearchCard({ research, locale, index, className }: ResearchCardProps) {
  const tax = await getTranslations({ locale, namespace: "taxonomies" });
  const common = await getTranslations({ locale, namespace: "common" });
  const href = `/research/${research._meta.path}`;

  return (
    <Link
      href={href}
      data-hud-label="RESEARCH"
      className={cn(
        "group relative flex flex-col justify-between overflow-hidden border border-[#e60026]/45 bg-[#160306]/90 p-6 backdrop-blur-xl shadow-[0_0_22px_rgba(230,0,38,0.22)] transition-all duration-500 hover:border-[#e60026] hover:bg-[#1a0005]/95 hover:shadow-[0_0_38px_rgba(230,0,38,0.5)] transform-gpu",
        className,
      )}
    >
      {/* HUD Top-Left Corner Bracket */}
      <span
        aria-hidden
        className="absolute left-0 top-0 h-3 w-3 border-l-2 border-t-2 border-[#e60026] shadow-[0_0_8px_#e60026]"
      />

      {/* HUD Bottom-Right Corner Bracket */}
      <span
        aria-hidden
        className="absolute bottom-0 right-0 h-3 w-3 border-b-2 border-r-2 border-[#e60026] shadow-[0_0_8px_#e60026]"
      />

      <div>
        {/* Top meta */}
        <div className="flex items-center justify-between font-mono">
          <span className="text-xs font-black uppercase tracking-widest text-[#e60026]">
            [{tax(`researchCategory.${research.category}`)}]
          </span>
          {index !== undefined && (
            <span aria-hidden className="text-xs font-black text-[#e60026]">
              [{String(index).padStart(2, "0")}]
            </span>
          )}
        </div>

        {/* Tags */}
        {research.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5 font-mono">
            {research.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="border border-neutral-800/80 bg-black/60 px-2 py-0.5 text-[0.65rem] uppercase tracking-widest text-neutral-400 group-hover:border-[#e60026]/50 group-hover:text-white"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Title */}
        <h3 className="mt-4 font-mono text-lg font-black uppercase leading-snug tracking-tight text-white transition-colors group-hover:text-[#e60026] md:text-xl">
          {research.title}
        </h3>

        {/* Summary */}
        <p className="mt-2.5 line-clamp-3 font-mono text-sm leading-relaxed text-neutral-400">
          {research.summary}
        </p>
      </div>

      {/* Footer */}
      <div className="mt-6 flex items-center justify-between border-t border-neutral-900 pt-4 font-mono text-xs text-neutral-500">
        <span className="flex items-center gap-1.5">
          <Clock className="text-[0.9em] opacity-60" aria-hidden />
          {formatDate(research.date, locale)}
        </span>
        <span className="font-bold text-[#e60026] transition-all duration-300 group-hover:translate-x-1">
          {common("readMore")} ▶
        </span>
      </div>
    </Link>
  );
}
