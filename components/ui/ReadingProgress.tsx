"use client";

import { motion, useScroll, useSpring } from "framer-motion";
import { usePathname } from "@/i18n/navigation";

/**
 * Global Top Reading & Scroll Progress Bar:
 * - Hidden on homepage (main page /)
 * - Rendered at z-[99999] fixed top edge on subpages (Writeups, Research, etc.)
 */
export function ReadingProgress() {
  const pathname = usePathname();

  // Show reading progress ONLY on actual post/article detail pages
  const isArticlePage =
    (pathname.startsWith("/writeups/") && pathname !== "/writeups") ||
    (pathname.startsWith("/research/") && pathname !== "/research");

  const { scrollYProgress } = useScroll();

  const scaleX = useSpring(scrollYProgress, {
    stiffness: 260,
    damping: 32,
    restDelta: 0.0001,
  });

  if (!isArticlePage) return null;

  return (
    <div
      aria-hidden
      className="fixed inset-x-0 top-0 z-[99999] pointer-events-none h-[4px] w-full overflow-visible bg-neutral-900/60 backdrop-blur-[1px]"
    >
      {/* Active Fill Laser Bar */}
      <motion.div
        className="h-full w-full bg-gradient-to-r from-[#e60026] via-[#ff2a4b] to-[#ffffff]"
        style={{
          scaleX,
          transformOrigin: "0% 50%",
          boxShadow:
            "0 0 16px rgba(230, 0, 38, 1), 0 0 30px rgba(255, 42, 75, 0.95), 0 0 8px rgba(255, 255, 255, 0.9)",
        }}
      />
    </div>
  );
}

