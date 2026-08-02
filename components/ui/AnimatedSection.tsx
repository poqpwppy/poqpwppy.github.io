"use client";

import { motion, useReducedMotion } from "framer-motion";
import { EASE } from "@/lib/animations";

type Variant = "slide-up" | "slide-left" | "slide-right" | "fade";

type AnimatedSectionProps = {
  children: React.ReactNode;
  className?: string;
  /** Delay before reveal (s), used to stagger sequential sections. */
  delay?: number;
  as?: "div" | "section" | "header" | "article" | "li";
  id?: string;
  variant?: Variant;
};

const VARIANTS: Record<Variant, { initial: Record<string, number | string>; animate: Record<string, number | string> }> = {
  "slide-up": {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
  },
  "slide-left": {
    initial: { opacity: 0, x: -12 },
    animate: { opacity: 1, x: 0 },
  },
  "slide-right": {
    initial: { opacity: 0, x: 12 },
    animate: { opacity: 1, x: 0 },
  },
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
  },
};

/**
 * Scroll-triggered reveal. Supports multiple entrance variants.
 * Respects `prefers-reduced-motion` — when set, content renders immediately.
 */
export function AnimatedSection({
  children,
  className,
  delay = 0,
  as: Tag = "div",
  id,
  variant = "slide-up",
}: AnimatedSectionProps) {
  const reduce = useReducedMotion();
  const MotionTag = motion[Tag];
  const { initial, animate } = VARIANTS[variant];

  return (
    <MotionTag
      id={id}
      className={className ? `${className} transform-gpu` : "transform-gpu"}
      initial={reduce ? false : initial}
      whileInView={animate}
      viewport={{ once: true, margin: "0px 0px -20px 0px" }}
      transition={{ duration: 0.45, ease: EASE, delay }}
    >
      {children}
    </MotionTag>
  );
}

