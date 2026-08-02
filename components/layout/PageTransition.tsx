"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { usePathname } from "@/i18n/navigation";

const EASE = [0.22, 1, 0.36, 1] as const;

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const reduce = useReducedMotion();

  return (
    <AnimatePresence>
      <motion.div
        key={pathname}
        initial={reduce ? false : { opacity: 0, y: 10, filter: "blur(4px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{
          duration: 0.4,
          ease: EASE,
        }}
        className="w-full min-h-[60vh] flex-1"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

