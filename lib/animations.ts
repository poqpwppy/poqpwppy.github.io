import type { Variants } from "framer-motion";

/** Shared Framer Motion variants — technical editorial motion language. */

export const EASE = [0.22, 1, 0.36, 1] as const;

/** Fade + rise. Default used for most section reveals. */
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: EASE },
  },
};

/** Fade only — for overlays, headers. */
export const fade: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5, ease: EASE } },
};

/** Stagger container — children reveal sequentially. */
export const stagger: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.07, delayChildren: 0.1 },
  },
};

/** Per-child variant meant to be nested inside `stagger`. */
export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: EASE },
  },
};

/** Scale-in for cards / dialogs. */
export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.45, ease: EASE },
  },
};

/** Word-by-word reveal for hero headlines. */
export const wordReveal: Variants = {
  hidden: { opacity: 0, y: "0.6em", rotateX: 40 },
  visible: {
    opacity: 1,
    y: 0,
    rotateX: 0,
    transition: { duration: 0.7, ease: EASE },
  },
};
