"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "framer-motion";
import { ArrowLeft } from "@/components/icons";

interface BackButtonProps {
  /** Fallback href if there's no navigation history */
  fallback?: string;
}

/**
 * Fixed HUD-style back button — top-left corner.
 * Auto-hides after scrolling 120px to avoid covering content.
 * Click: go back in history, or fallback to the provided href.
 */
export function BackButton({ fallback = "/writeups" }: BackButtonProps) {
  const router = useRouter();
  const [visible, setVisible] = useState(true);
  const [mounted, setMounted] = useState(false);
  const prevScrollY = useRef(0);
  const { scrollY } = useScroll();

  useEffect(() => {
    setMounted(true);
  }, []);

  useMotionValueEvent(scrollY, "change", (y) => {
    if (y < 80) {
      setVisible(true);
    } else if (y > prevScrollY.current + 8) {
      setVisible(false);
    } else if (y < prevScrollY.current - 8) {
      setVisible(true);
    }
    prevScrollY.current = y;
  });

  const handleBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push(fallback);
    }
  };

  if (!mounted) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          key="back-button"
          type="button"
          onClick={handleBack}
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          aria-label="Go back"
          className="fixed left-5 top-5 z-50 group flex items-center gap-2 border border-neutral-800 bg-black/80 px-3.5 py-2 font-mono text-[0.68rem] font-bold uppercase tracking-[0.18em] text-neutral-400 backdrop-blur-xl shadow-lg transition-colors duration-300 hover:border-[#e60026] hover:text-white hover:shadow-[0_0_18px_rgba(230,0,38,0.4)]"
        >
          {/* HUD corner brackets */}
          <span
            aria-hidden
            className="absolute left-0 top-0 h-2 w-2 border-l border-t border-transparent transition-colors duration-300 group-hover:border-[#e60026] group-hover:shadow-[0_0_6px_#e60026]"
          />
          <span
            aria-hidden
            className="absolute bottom-0 right-0 h-2 w-2 border-b border-r border-transparent transition-colors duration-300 group-hover:border-[#e60026] group-hover:shadow-[0_0_6px_#e60026]"
          />

          <motion.span
            animate={{ x: [0, -3, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut", repeatDelay: 1 }}
          >
            <ArrowLeft className="text-sm" aria-hidden />
          </motion.span>
          <span>Back</span>
        </motion.button>
      )}
    </AnimatePresence>
  );
}
