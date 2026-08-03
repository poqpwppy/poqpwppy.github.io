"use client";

import { useState, useEffect } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { TocEntry } from "./TocSidebar";

function normalizeEntries(toc: TocEntry[] | undefined): TocEntry[] {
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

const HEADER_OFFSET = 110;

const drawerVariants = {
  hidden: { y: "100%", opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 320, damping: 30 },
  },
  exit: {
    y: "100%",
    opacity: 0,
    transition: { duration: 0.22, ease: [0.4, 0, 1, 1] },
  },
};

const listVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.03, delayChildren: 0.04 } },
};

const listItemVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.22, ease: [0.22, 1, 0.36, 1] },
  },
};

export function MobileTocCapsule({ toc, label }: { toc: TocEntry[]; label?: string }) {
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [nearEnd, setNearEnd] = useState(false);
  const [active, setActive] = useState<string>("");
  const [items, setItems] = useState<TocEntry[]>(() => toc ?? []);

  useEffect(() => {
    const collectHeadings = () => {
      const headings = Array.from(
        document.querySelectorAll(
          "main article h1, main article h2, main article h3, main article h4, .prose-article h1, .prose-article h2, .prose-article h3, .prose-article h4"
        )
      );

      return headings.map((h, i) => {
        const rawText = h.textContent?.replace(/\s+/g, " ").trim() ?? "";
        const slug = rawText
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

    const list = normalizeEntries(toc.length ? toc : collectHeadings());
    setItems(list);

    if (!list.length) return;

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
    return () => window.removeEventListener("scroll", handleScroll);
  }, [toc]);

  // Fade the floating INDEX button out once the reader scrolls into the
  // related-posts section (near the end of the post), and fade it back in
  // when scrolling back up into the article body. Closing the drawer too if
  // it was open. Posts without a related section have no sentinel element,
  // so the button stays visible the whole time.
  useEffect(() => {
    const related = document.getElementById("related-posts");
    if (!related) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setNearEnd(entry.isIntersecting);
        if (entry.isIntersecting) setOpen(false);
      },
      { rootMargin: "0px" },
    );
    observer.observe(related);
    return () => observer.disconnect();
  }, []);

  if (!items || !items.length) return null;

  const scrollTo = (id: string) => {
    setOpen(false);
    const el = document.getElementById(id);
    if (!el) return;

    const targetY = window.scrollY + el.getBoundingClientRect().top - HEADER_OFFSET;
    window.scrollTo({
      top: Math.max(targetY, 0),
      behavior: "smooth",
    });
  };

  return (
    <div className="fixed bottom-6 right-6 z-40 lg:hidden">
      {/* Floating toggle button — fades out near the end of the post */}
      <motion.div
        animate={{
          opacity: nearEnd ? 0 : 1,
          y: nearEnd ? 16 : 0,
          pointerEvents: nearEnd ? "none" : "auto",
        }}
        transition={{ duration: reduce ? 0 : 0.3, ease: [0.4, 0, 0.2, 1] }}
        aria-hidden={nearEnd || undefined}
      >
      <motion.button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        tabIndex={nearEnd ? -1 : 0}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.94 }}
        className="relative flex items-center gap-2 border border-neutral-700/80 bg-black/85 px-4 py-2 font-mono text-xs font-bold uppercase tracking-wider text-neutral-200 backdrop-blur-xl shadow-xl hover:border-[#e60026] hover:text-[#e60026] transition-colors duration-300"
      >
        {/* Pulse ring when open */}
        <AnimatePresence>
          {open && (
            <motion.span
              key="ring"
              initial={{ scale: 0.8, opacity: 0.7 }}
              animate={{ scale: 1.5, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 0.5 }}
              className="absolute inset-0 border border-[#e60026] rounded-sm"
            />
          )}
        </AnimatePresence>

        <motion.span
          className="h-1.5 w-1.5 rounded-full bg-[#e60026] shadow-[0_0_6px_#e60026]"
          animate={open ? { opacity: [1, 0.3, 1] } : { opacity: 1 }}
          transition={{ duration: 1, repeat: open ? Infinity : 0 }}
        />
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 22 }}
        >
          {open ? "✕" : "≡"}
        </motion.span>
        <span>{open ? "CLOSE" : "INDEX"}</span>
      </motion.button>
      </motion.div>

      {/* Slide-up drawer */}
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            />

            {/* Drawer panel — slides up from bottom */}
            <motion.div
              key="drawer"
              variants={reduce ? {} : drawerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="fixed bottom-0 left-0 right-0 z-50 max-h-[72vh] overflow-hidden border-t border-[#e60026]/40 bg-black/95 backdrop-blur-2xl shadow-[0_-8px_40px_rgba(230,0,38,0.18)]"
            >
              {/* Handle bar */}
              <div className="flex justify-center pt-3 pb-1">
                <div className="h-1 w-10 rounded-full bg-neutral-700" />
              </div>

              {/* Header */}
              <div className="flex items-center justify-between border-b border-neutral-800/80 px-5 py-3">
                <span className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-[0.2em] text-[#e60026]">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#e60026] shadow-[0_0_6px_#e60026]" />
                  {label ?? "IN-POST NAVIGATION"}
                </span>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="font-mono text-xs text-neutral-400 hover:text-white transition-colors"
                >
                  [ ESC ]
                </button>
              </div>

              {/* Item list */}
              <motion.ul
                className="overflow-y-auto max-h-[55vh] flex flex-col space-y-0.5 px-4 py-3"
                variants={listVariants}
                initial="hidden"
                animate="visible"
              >
                {items.map((item) => {
                  const isActive = active === item.id;
                  return (
                    <motion.li key={item.id} variants={listItemVariants}>
                      <button
                        type="button"
                        onClick={() => scrollTo(item.id)}
                        className={cn(
                          "group w-full text-left relative flex items-center gap-2 overflow-hidden px-3 py-2 font-mono text-xs transition-colors duration-200",
                          item.depth === 3 && "pl-5 text-[0.7rem]",
                          item.depth === 4 && "pl-7 text-[0.65rem]",
                          isActive
                            ? "text-white font-bold bg-[#e60026]/15 border-l-2 border-[#e60026]"
                            : "text-neutral-300 hover:text-white hover:bg-white/[0.04]"
                        )}
                      >
                        {/* Hover beam */}
                        <span
                          aria-hidden
                          className="pointer-events-none absolute inset-0 translate-x-[-100%] bg-gradient-to-r from-transparent via-white/[0.04] to-transparent transition-transform duration-500 group-hover:translate-x-[100%]"
                        />
                        <span className={cn("shrink-0 transition-colors", isActive ? "text-[#ff2a4b]" : "text-[#e60026] opacity-60")}>
                          ›
                        </span>
                        <span className="line-clamp-1">{item.text}</span>
                      </button>
                    </motion.li>
                  );
                })}
              </motion.ul>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

