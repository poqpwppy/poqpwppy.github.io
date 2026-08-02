"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { NavDrawer } from "./NavDrawer";
import { useIntroStage } from "./IntroLoader";

/**
 * Minimalist Sci-Fi Text Menu Toggle Button [ MENU ] / [ CLOSE ].
 * Synchronized AnimatePresence text morphing & spring hover.
 */
export function MenuButton() {
  const t = useTranslations("nav");
  const { stage } = useIntroStage();
  const [open, setOpen] = useState(false);
  const isVisible = stage === "full";

  const toggle = () => setOpen((prev) => !prev);
  const close = () => setOpen(false);

  // Close on route change or ESC key
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <motion.button
        type="button"
        onClick={toggle}
        aria-expanded={open}
        aria-controls="nav-drawer"
        aria-label={open ? t("closeMenu") : t("menu")}
        data-hud-label={open ? "CLOSE" : "MENU"}
        initial={{ opacity: 0 }}
        animate={{ opacity: isVisible ? 1 : 0 }}
        transition={{ duration: 0.6 }}
        style={{ pointerEvents: isVisible ? "auto" : "none" }}
        whileHover={{ scale: 1.12 }}
        whileTap={{ scale: 0.95 }}
        className={cn(
          "fixed right-6 top-6 z-50 flex items-center justify-center rounded-md border px-3.5 py-1.5 font-mono text-xs font-black uppercase tracking-widest transition-colors duration-500 backdrop-blur-md cursor-pointer group shadow-lg",
          open
            ? "border-[#e60026] bg-[#e60026] text-white shadow-[0_0_20px_rgba(230,0,38,0.8)]"
            : "border-neutral-700/80 bg-black/70 text-neutral-300 hover:border-[#e60026] hover:text-[#e60026] hover:shadow-[0_0_16px_rgba(230,0,38,0.7)]"
        )}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={open ? "close" : "menu"}
            initial={{ opacity: 0, y: open ? -6 : 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: open ? 6 : -6 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          >
            {open ? "[ CLOSE ]" : "[ MENU ]"}
          </motion.span>
        </AnimatePresence>
      </motion.button>

      <NavDrawer open={open} onClose={close} />
    </>
  );
}
