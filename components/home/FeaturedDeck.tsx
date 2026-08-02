"use client";

import { useState, useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { Writeup } from "@/.content-collections/generated";
import { cn, formatDate } from "@/lib/utils";
import { DIFFICULTY_COLORS } from "@/lib/constants";
import { ArrowUpRight, Clock } from "@/components/icons";

type FeaturedDeckProps = {
  items: Writeup[];
  locale: string;
};

export function FeaturedDeck({ items, locale }: FeaturedDeckProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const tax = useTranslations("taxonomies");
  const common = useTranslations("common");
  const reduce = useReducedMotion();

  const [activeIndex, setActiveIndex] = useState(0);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const deckY = useTransform(scrollYProgress, [0, 1], [140, -140]);
  const deckRotateX = useTransform(scrollYProgress, [0, 0.5, 1], [12, 0, -8]);
  const deckScale = useTransform(scrollYProgress, [0, 0.5, 1], [0.92, 1, 0.96]);

  const count = items.length;
  if (!count) return null;

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % count);
  };

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + count) % count);
  };

  // Helper to compute radial orbital offset (-1, 0, +1)
  const getOffset = (idx: number) => {
    let diff = idx - activeIndex;
    if (diff > count / 2) diff -= count;
    if (diff < -count / 2) diff += count;
    return diff;
  };

  return (
    <section ref={sectionRef} className="relative w-full py-16 overflow-hidden">
      <motion.div
        style={{
          y: reduce ? 0 : deckY,
          rotateX: reduce ? 0 : deckRotateX,
          scale: reduce ? 1 : deckScale,
        }}
        className="container-page transform-gpu"
      >
        {/* HUD Section Header */}
        <div className="mb-10 flex flex-wrap items-center justify-between gap-4 border-b border-neutral-800/80 pb-5">
          <div className="flex items-center gap-3 font-mono">
            <span className="text-xs font-black uppercase text-[#e60026]">
              [02]
            </span>
            <span className="text-xs font-black uppercase tracking-widest text-white">
              {/* FEATURED WRITEUPS RADIAL DECK */}
            </span>
            <span className="hidden sm:inline-flex items-center gap-1.5 text-[0.65rem] text-neutral-500">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#e60026] shadow-[0_0_6px_#e60026]" />
              RADIAL ORBIT: ACTIVE
            </span>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center gap-3 font-mono text-xs font-black uppercase tracking-widest">
            <span className="text-neutral-400">
              [{String(activeIndex + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}]
            </span>
            <div className="flex items-center gap-1.5">
              <motion.button
                type="button"
                onClick={handlePrev}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="flex items-center justify-center border border-neutral-800 bg-black/70 px-3 py-1.5 text-neutral-300 transition-colors hover:border-[#e60026] hover:text-white hover:shadow-[0_0_12px_rgba(230,0,38,0.6)] cursor-pointer"
              >
                ◄ PREV
              </motion.button>
              <motion.button
                type="button"
                onClick={handleNext}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="flex items-center justify-center border border-neutral-800 bg-black/70 px-3 py-1.5 text-neutral-300 transition-colors hover:border-[#e60026] hover:text-white hover:shadow-[0_0_12px_rgba(230,0,38,0.6)] cursor-pointer"
              >
                NEXT ►
              </motion.button>
            </div>
          </div>
        </div>

        {/* SAO Radial Orbit Card Carousel Stage */}
        <div className="relative min-h-[440px] sm:min-h-[460px] w-full flex items-center justify-center perspective-[1400px]">
          {items.map((item, idx) => {
            const offset = getOffset(idx);
            const absOffset = Math.abs(offset);
            const isVisible = absOffset <= 2;
            if (!isVisible) return null;

            const isCenter = offset === 0;
            const difficultyColor = DIFFICULTY_COLORS[item.difficulty] ?? "#e60026";

            // Compute radial orbit arc positions
            const angleDeg = offset * 28;
            const angleRad = (angleDeg * Math.PI) / 180;
            const radius = 460; // Radial orbital radius

            const orbitalX = Math.sin(angleRad) * radius;
            const orbitalY = (1 - Math.cos(angleRad)) * radius * 0.35;
            const orbitalRotateY = -angleDeg * 0.85;

            // Symmetrical tail fade: center = 1, adjacent = 0.45, outer tail (+-2) = 0
            const cardOpacity = isCenter ? 1 : absOffset === 1 ? 0.45 : 0;
            const cardScale = isCenter ? 1 : absOffset === 1 ? 0.82 : 0.65;

            return (
              <motion.div
                key={item._meta.path}
                initial={false}
                animate={{
                  x: orbitalX,
                  y: orbitalY,
                  rotateY: orbitalRotateY,
                  scale: cardScale,
                  opacity: cardOpacity,
                  zIndex: isCenter ? 30 : 10 - absOffset,
                }}
                transition={{
                  type: "spring",
                  stiffness: 180,
                  damping: 22,
                  mass: 0.8,
                }}
                onClick={() => absOffset === 1 && setActiveIndex(idx)}
                className={cn(
                  "absolute w-full max-w-2xl transform-gpu rounded-md p-6 sm:p-10 backdrop-blur-xl border transition-colors duration-500",
                  isCenter
                    ? "cursor-default border-[#e60026] bg-[#1a0005]/95 text-white shadow-[0_0_40px_rgba(230,0,38,0.55)]"
                    : absOffset === 1
                    ? "cursor-pointer border-[#e60026]/40 bg-[#120003]/80 text-neutral-300 shadow-lg hover:border-[#e60026] hover:opacity-80"
                    : "pointer-events-none border-transparent bg-transparent"
                )}
              >
                {/* HUD Top-Left Corner Bracket (Active Card) */}
                {isCenter && (
                  <span
                    aria-hidden
                    className="absolute left-0 top-0 h-3.5 w-3.5 border-l-2 border-t-2 border-[#e60026] shadow-[0_0_10px_#e60026]"
                  />
                )}

                {/* HUD Bottom-Right Corner Bracket (Active Card) */}
                {isCenter && (
                  <span
                    aria-hidden
                    className="absolute bottom-0 right-0 h-3.5 w-3.5 border-b-2 border-r-2 border-[#e60026] shadow-[0_0_10px_#e60026]"
                  />
                )}

                {/* Card Meta Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2 font-mono text-xs font-black uppercase tracking-widest text-[#e60026]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#e60026] shadow-[0_0_8px_#e60026]" />
                    [{tax(`category.${item.category}`)}]
                  </div>
                  <div className="flex items-center gap-3 font-mono text-xs text-neutral-400">
                    <span style={{ color: difficultyColor }} className="font-bold">
                      {tax(`difficulty.${item.difficulty}`)}
                    </span>
                    
                    <span>{formatDate(item.date, locale)}</span>
                  </div>
                </div>

                {/* Card Title */}
                <h3 className="mt-6 font-mono text-2xl font-black uppercase tracking-tight text-white transition-colors group-hover:text-[#e60026] sm:text-3xl md:text-4xl leading-tight">
                  {item.title}
                </h3>

                {/* Card Description */}
                {item.description && (
                  <p className="mt-4 font-mono text-sm leading-relaxed text-neutral-400 line-clamp-3 md:text-base">
                    {item.description}
                  </p>
                )}

                {/* Footer Bar & Action */}
                <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-neutral-900 pt-5 font-mono text-xs text-neutral-500">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex items-center gap-1.5">
                      <Clock className="text-[0.9em] opacity-70" aria-hidden />
                      {common("minRead", { count: item.readingTime })}
                    </span>
                    {item.ctfName && (
                      <span className="text-neutral-300">{item.ctfName}</span>
                    )}
                  </div>

                  {isCenter ? (
                    <Link
                      href={`/writeups/${item._meta.path}`}
                      className="inline-flex items-center gap-2 border border-[#e60026] bg-[#e60026]/10 px-4 py-2 font-mono text-xs font-black uppercase tracking-widest text-white transition-all hover:bg-[#e60026] hover:shadow-[0_0_16px_rgba(230,0,38,0.8)]"
                    >
                      READ WRITEUP
                      <ArrowUpRight className="text-sm" />
                    </Link>
                  ) : (
                    <span className="font-mono text-[0.65rem] uppercase tracking-widest text-neutral-500">
                      [ CLICK TO SELECT ]
                    </span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </section>
  );
}
