"use client";

import { useRef, type ReactNode } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

type ParallaxColumnsProps = {
  /** Left column body — the stacked writeup cards (server-rendered). */
  left: ReactNode;
  /** Right column body — the stacked research cards (server-rendered). */
  right: ReactNode;
};

/**
 * Brutalist dual-column parallax band.
 *
 * Left column ("01 // WRITEUPS") translates farther and faster; right column
 * ("02 // RESEARCH") translates less and is nudged down with a static phase
 * offset — so the two columns read as drifting past each other at different
 * speeds. The whole column (header + cards) is transformed together, so the
 * header is never overlapped by the rising card stack.
 *
 * ASCII-matrix hover scramble / glow still reacts because the cards inside
 * keep their `data-hud-label` interactive hooks for the global <Background/>.
 */
export function ParallaxColumns({ left, right }: ParallaxColumnsProps) {
  const home = useTranslations("home");
  const common = useTranslations("common");
  const reduce = !!useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);

  // Progress 0 → 1 across the entire time the band is on-screen.
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  // Fast column drifts ~4× farther than the slow column.
  const fastY = useTransform(scrollYProgress, [0, 1], [50, -110]);
  const slowY = useTransform(scrollYProgress, [0, 1], [12, -28]);

  return (
    <section
      id="columns"
      ref={ref}
      className="container-page relative py-16 md:py-24"
    >
      <div className="grid grid-cols-1 items-start gap-14 lg:grid-cols-2 lg:gap-12">
        {/* ── LEFT: [ 01 // WRITEUPS ] (Fast scroll) ── */}
        <motion.div
          style={reduce ? undefined : { y: fastY, willChange: "transform" }}
          className="flex flex-col gap-6"
        >
          <ColumnHeader
            index="01"
            label={home("colWriteups")}
            note={home("colFast")}
            viewAllHref="/writeups"
            viewAllLabel={common("viewAll")}
          />
          <div className="flex flex-col gap-6">{left}</div>
        </motion.div>

        {/* ── RIGHT: [ 02 // RESEARCH ] (Slow scroll) — phase-offset down ── */}
        <motion.div
          style={reduce ? undefined : { y: slowY, willChange: "transform" }}
          className="flex flex-col gap-6 lg:pt-16"
        >
          <ColumnHeader
            index="02"
            label={home("colResearch")}
            note={home("colSlow")}
            viewAllHref="/research"
            viewAllLabel={common("viewAll")}
          />
          <div className="flex flex-col gap-6">{right}</div>
        </motion.div>
      </div>
    </section>
  );
}

function ColumnHeader({
  index,
  label,
  note,
  viewAllHref,
  viewAllLabel,
}: {
  index: string;
  label: string;
  note: string;
  viewAllHref: string;
  viewAllLabel: string;
}) {
  return (
    <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
      <div className="flex items-center gap-3">
        <span className="bg-neutral-800 px-2 py-0.5 font-mono text-xs font-black text-white">
          {index}
        </span>
        <span className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-white">
          {"//"} {label}
        </span>
        <span className="hidden font-mono text-[0.65rem] uppercase tracking-widest text-neutral-500 sm:inline">
          ({note})
        </span>
      </div>
      <Link
        href={viewAllHref}
        className="font-mono text-xs uppercase tracking-widest text-neutral-400 transition-colors hover:text-white"
      >
        {viewAllLabel} →
      </Link>
    </div>
  );
}
