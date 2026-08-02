"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

export function StaggeredGrid({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={{
        hidden: {},
        show: {
          transition: {
            staggerChildren: 0.08,
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function StaggeredItem({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 25, scale: 0.96 },
        show: {
          opacity: 1,
          y: 0,
          scale: 1,
          transition: {
            type: "spring",
            stiffness: 220,
            damping: 20,
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
