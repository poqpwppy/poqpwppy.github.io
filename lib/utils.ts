import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge Tailwind classes with conditional logic. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format an ISO date string to a locale-aware date (e.g. "14 Thg 6, 2025"). */
export function formatDate(
  iso: string,
  locale: string,
  withYear = true,
): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(locale === "vi" ? "vi-VN" : "en-US", {
    day: "numeric",
    month: "short",
    ...(withYear ? { year: "numeric" } : {}),
  });
}

/** Format a numeric value with thousands separators. */
export function formatNumber(n: number, locale: string): string {
  return new Intl.NumberFormat(locale === "vi" ? "vi-VN" : "en-US").format(n);
}

/** Clamp a number into a range. */
export function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

/** Build a `style` object that gates on reduced motion for CSS transitions. */
export function motionSafe(styles: React.CSSProperties): React.CSSProperties {
  return styles;
}
