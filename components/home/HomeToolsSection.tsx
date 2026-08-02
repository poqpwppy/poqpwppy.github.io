"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { Link } from "@/i18n/navigation";
import type { Tool } from "@/.content-collections/generated";
import { ToolCard } from "@/components/tools/ToolCard";

type HomeToolsSectionProps = {
  tools: Tool[];
  locale: string;
  viewAllLabel: string;
};

export function HomeToolsSection({
  tools,
  locale,
  viewAllLabel,
}: HomeToolsSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const sectionY = useTransform(scrollYProgress, [0, 1], [100, -60]);
  const sectionScale = useTransform(scrollYProgress, [0, 0.5, 1], [0.95, 1, 0.98]);

  return (
    <section ref={sectionRef} className="container-page border-t border-neutral-900 pb-24 pt-16 overflow-hidden">
      <motion.div
        style={{
          y: reduce ? 0 : sectionY,
          scale: reduce ? 1 : sectionScale,
        }}
        className="w-full transform-gpu"
      >
        <div className="mb-8 flex items-center justify-between border-b border-neutral-800 pb-4">
          <div className="flex items-center gap-3">
            <span className="bg-neutral-800 px-2 py-0.5 font-mono text-xs font-black text-white">
              03
            </span>
            <span className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-white">
              {"//"} TOOLS & AUDIT UTILITIES
            </span>
          </div>
          <Link
            href="/tools"
            className="font-mono text-xs uppercase tracking-widest text-neutral-400 hover:text-white transition-colors"
          >
            {viewAllLabel} →
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {tools.map((tool, idx) => (
            <motion.div
              key={tool.name}
              initial={false}
              style={{
                y: reduce ? 0 : (idx % 2 === 0 ? 0 : 25), // Alternating card depth offset
              }}
            >
              <ToolCard tool={tool} locale={locale} />
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
