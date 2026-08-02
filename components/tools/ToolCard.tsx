"use client";
import type { Tool } from "@/.content-collections/generated";
import { cn, formatNumber } from "@/lib/utils";
import { ExternalLink, Star } from "@/components/icons";
import { motion } from "framer-motion";

const MotionLink = motion.a;

export function ToolCard({
  tool,
  locale,
  className,
}: {
  tool: Tool;
  locale: string;
  className?: string;
}) {
  return (
    <MotionLink
      href={tool.repository}
      target="_blank"
      rel="noreferrer noopener"
      className={cn(
        "group relative flex flex-col justify-between overflow-hidden border border-[#e60026]/45 bg-[#160306]/90 p-6 backdrop-blur-xl shadow-[0_0_22px_rgba(230,0,38,0.22)] transition-all duration-500 hover:border-[#e60026] hover:bg-[#1a0005]/95 hover:shadow-[0_0_38px_rgba(230,0,38,0.5)] transform-gpu",
        className,
      )}
      whileHover={{ scale: 1.04, rotateY: -3, boxShadow: "0 0 20px rgba(230,0,38,0.6)" }}
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
      <div className="flex items-center justify-between gap-3 font-mono">
        <span className="text-sm font-black text-white transition-colors group-hover:text-[#e60026]">
          ~/tools/<span className="text-neutral-300 group-hover:text-white">{tool.name}</span>
        </span>
        <ExternalLink className="shrink-0 text-neutral-500 transition-colors group-hover:text-[#e60026]" aria-hidden />
      </div>
      <p className="mt-3 line-clamp-2 font-mono text-sm leading-relaxed text-neutral-400">
        {tool.description}
      </p>
      <div className="mt-5 flex flex-wrap items-center gap-2 pt-2 border-t border-neutral-900 font-mono text-xs text-neutral-500">
        <span className="border border-neutral-800 bg-black/60 px-2 py-0.5 text-[0.65rem] uppercase tracking-widest text-[#e60026]">
          [{tool.language}]
        </span>
        {tool.stars !== undefined ? (
          <span className="inline-flex items-center gap-1 text-neutral-300">
            <Star className="text-[0.85em] text-[#e60026]" aria-hidden />
            {formatNumber(tool.stars, locale)}
          </span>
        ) : null}
        <span className="ml-auto uppercase text-neutral-400">[{tool.category}]</span>
      </div>
    </MotionLink>
  );
}
