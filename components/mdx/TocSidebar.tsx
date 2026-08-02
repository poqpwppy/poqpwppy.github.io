"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

const HEADER_OFFSET = 110;

export type TocEntry = { id: string; text: string; depth: number };

type TocSidebarProps = {
  toc: TocEntry[];
  label?: string;
};

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.03, delayChildren: 0.06 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.25, ease: [0.22, 1, 0.36, 1] },
  },
};

function normalizeTocEntries(toc: TocEntry[] | undefined): TocEntry[] {
  const seen = new Set<string>();
  return (toc ?? [])
    .filter((item) => Boolean(item?.id && item?.text?.trim()))
    .filter((item) => {
      const key = `${item.id}::${item.text.trim()}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

/**
 * SAO HUD Cyber Content Navigation (TOC Sidebar):
 * - Gliding Framer Motion crimson laser tracker (layoutId="active-toc-laser")
 * - Gliding background active sweep (layoutId="active-toc-bg")
 * - High-precision scroll position heading detection
 * - SAO HUD Corner Brackets & Hover Beams
 */
export function TocSidebar({ toc, label }: TocSidebarProps) {
  const reduce = useReducedMotion();
  const [active, setActive] = useState<string>("");
  const [items, setItems] = useState<TocEntry[]>(() => normalizeTocEntries(toc));
  const [revealed, setRevealed] = useState(false);
  const revealTimer = useRef<number | null>(null);

  useEffect(() => {
    const collectHeadings = () => {
      const headings = Array.from(
        document.querySelectorAll(
          "main article h1, main article h2, main article h3, main article h4, .prose-article h1, .prose-article h2, .prose-article h3, .prose-article h4"
        )
      );

      return headings.map((h, i) => {
        const rawText = h.textContent?.replace(/\s+/g, " ").trim() ?? "";
        const slug =
          rawText
            .toLowerCase()
            .normalize("NFKD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, "") || `section-${i + 1}`;

        if (!h.id) {
          h.id = `sec-${i + 1}-${slug}`;
        }
        return {
          id: h.id,
          text: rawText || `Section ${i + 1}`,
          depth: Number(h.tagName[1]) || 2,
        };
      });
    };

    const list = normalizeTocEntries(toc.length ? toc : collectHeadings());
    setItems(list);
    setRevealed(false);

    if (revealTimer.current) clearTimeout(revealTimer.current);
    revealTimer.current = window.setTimeout(() => setRevealed(true), 100);

    if (!list.length) return;

    // Accurate scroll tracking for active heading
    const handleScroll = () => {
      const scrollPos = window.scrollY + HEADER_OFFSET + 30;
      let currentActive = list[0].id;

      for (const item of list) {
        const el = document.getElementById(item.id);
        if (el) {
          const top = el.getBoundingClientRect().top + window.scrollY;
          if (scrollPos >= top) {
            currentActive = item.id;
          }
        }
      }
      setActive(currentActive);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (revealTimer.current) clearTimeout(revealTimer.current);
    };
  }, [toc]);

  const scrollTo = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (!el) return;

    const targetY = window.scrollY + el.getBoundingClientRect().top - HEADER_OFFSET;
    setActive(id);

    window.scrollTo({
      top: Math.max(targetY, 0),
      behavior: "smooth",
    });
  }, []);

  if (!items.length) return null;

  return (
    <nav aria-label={label} className="sticky top-28 max-h-[78vh] overflow-y-auto pr-2 select-none">
      {/* Header Label */}
      <motion.div
        className="mb-4 flex items-center gap-2 font-mono text-[0.68rem] font-black uppercase tracking-[0.2em] text-[#ff2a4b]"
        initial={false}
        animate={revealed ? { opacity: 1, x: 0 } : { opacity: 0, x: -8 }}
        transition={{ duration: 0.25 }}
      >
        <span className="h-2 w-2 animate-pulse rounded-full bg-[#e60026] shadow-[0_0_8px_#e60026]" />
        {label ?? "INDEX // CONTENT NAV"}
      </motion.div>

      {/* Item list */}
      <motion.ul
        className="relative flex flex-col space-y-1 border-l border-neutral-800/80 pl-3"
        variants={containerVariants}
        initial="hidden"
        animate={revealed ? "visible" : "hidden"}
      >
        {items.map((item, idx) => {
          const isActive = active === item.id || (!active && idx === 0);

          return (
            <motion.li
              key={item.id}
              className="relative"
              variants={itemVariants}
            >
              {/* Gliding Crimson Laser Tracker Bar */}
              {isActive && !reduce && (
                <motion.span
                  layoutId="active-toc-laser-indicator"
                  transition={{ type: "spring", stiffness: 380, damping: 32 }}
                  className="absolute -left-[14px] top-1/2 -translate-y-1/2 h-5 w-[3.5px] bg-[#e60026] shadow-[0_0_12px_#e60026,0_0_24px_#ff2a4b] rounded-full z-10"
                />
              )}

              <a
                href={`#${item.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  scrollTo(item.id);
                }}
                className={cn(
                  "group relative flex items-center overflow-hidden rounded-sm px-3 py-1.5 font-mono text-[0.72rem] font-semibold leading-snug tracking-wide transition-all duration-300",
                  item.depth === 3 && "ml-3 text-[0.68rem]",
                  item.depth === 4 && "ml-5 text-[0.64rem]",
                  isActive
                    ? "font-extrabold text-white drop-shadow-[0_0_12px_rgba(255,255,255,0.4)]"
                    : "text-neutral-400 hover:text-white"
                )}
              >
                {/* Gliding Active Background Highlight */}
                {isActive && !reduce && (
                  <motion.span
                    layoutId="active-toc-bg-highlight"
                    transition={{ type: "spring", stiffness: 320, damping: 30 }}
                    aria-hidden
                    className="absolute inset-0 bg-gradient-to-r from-[#e60026]/20 via-[#e60026]/10 to-transparent border-l-2 border-[#e60026]"
                  />
                )}

                {/* Hover beam */}
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-0 translate-x-[-100%] bg-gradient-to-r from-transparent via-white/[0.06] to-transparent transition-transform duration-500 group-hover:translate-x-[100%]"
                />

                {/* HUD corner brackets on active */}
                {isActive && (
                  <>
                    <span
                      aria-hidden
                      className="absolute left-0 top-0 h-1.5 w-1.5 border-l border-t border-[#e60026] shadow-[0_0_5px_#e60026]"
                    />
                    <span
                      aria-hidden
                      className="absolute bottom-0 right-0 h-1.5 w-1.5 border-b border-r border-[#e60026] shadow-[0_0_5px_#e60026]"
                    />
                  </>
                )}

                <span className="relative z-10 line-clamp-2">{item.text}</span>
              </a>
            </motion.li>
          );
        })}
      </motion.ul>
    </nav>
  );
}

