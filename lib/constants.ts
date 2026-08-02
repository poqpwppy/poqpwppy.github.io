/** Taxonomy constants shared across the app. */

export const WRITEUP_CATEGORIES = [
  "web",
  "pwn",
  "crypto",
  "reverse",
  "forensics",
  "osint",
  "misc",
  "network",
] as const;

export const WRITEUP_DIFFICULTIES = ["easy", "medium", "hard", "insane"] as const;

export const WRITEUP_PLATFORMS = [
  "hackthebox",
  "tryhackme",
  "ctftime",
  "rootme",
  "other",
] as const;

export const RESEARCH_CATEGORIES = [
  "vulnerability",
  "methodology",
  "analysis",
  "tool",
  "theory",
] as const;

export const RESEARCH_STATUSES = ["published", "wip", "private"] as const;

export const TOOL_CATEGORIES = [
  "recon",
  "exploitation",
  "post-exploitation",
  "crypto",
  "forensics",
  "utility",
] as const;

export type WriteupCategory = (typeof WRITEUP_CATEGORIES)[number];
export type WriteupDifficulty = (typeof WRITEUP_DIFFICULTIES)[number];
export type WriteupPlatform = (typeof WRITEUP_PLATFORMS)[number];
export type ResearchCategory = (typeof RESEARCH_CATEGORIES)[number];
export type ToolCategory = (typeof TOOL_CATEGORIES)[number];

/** Per-platform brand color (hex). */
export const PLATFORM_COLORS: Record<string, string> = {
  hackthebox: "#9F1A1A",
  tryhackme: "#E84D2C",
  ctftime: "#FF6B35",
  rootme: "#4B8CFF",
  other: "#8b8b94",
};

/** Categorical color scale for charts (acid-chrome ramp). */
export const CHART_COLORS = [
  "#d4ff2e", // acid lime
  "#67e8ff", // chrome cyan
  "#a855f7", // chrome violet
  "#ff2e6b", // hot magenta
  "#ffd166", // amber
  "#38bdf8", // sky
  "#ffa03d", // ember
  "#f2f2f5", // fog
] as const;

/** Difficulty → color (darker = harder). */
export const DIFFICULTY_COLORS: Record<WriteupDifficulty, string> = {
  easy: "#d4ff2e",
  medium: "#ffd166",
  hard: "#ff2e6b",
  insane: "#ff5c5c",
};
