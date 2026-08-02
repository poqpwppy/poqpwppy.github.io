import type { Writeup } from "../.content-collections/generated";
import { WRITEUP_CATEGORIES, WRITEUP_DIFFICULTIES } from "./constants";

/** Count writeups per category, ordered by the canonical order. */
export function categoryBreakdown(writeups: Writeup[]) {
  return WRITEUP_CATEGORIES.map((cat) => ({
    name: cat,
    count: writeups.filter((w) => w.category === cat).length,
  })).filter((d) => d.count > 0);
}

/** Count writeups per difficulty. */
export function difficultyBreakdown(writeups: Writeup[]) {
  return WRITEUP_DIFFICULTIES.map((d) => ({
    name: d,
    count: writeups.filter((w) => w.difficulty === d).length,
  })).filter((x) => x.count > 0);
}

/** Bucket writeup activity into the last `months` calendar months. */
export function activityBuckets(
  writeups: Writeup[],
  months = 6,
): { label: string; count: number }[] {
  const now = new Date();
  const out: { label: string; count: number }[] = [];
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    out.push({
      label: d.toLocaleDateString("en-US", { month: "short" }),
      count: writeups.filter((w) => String(w.date).startsWith(key)).length,
    });
  }
  return out;
}

/** Longest streak of consecutive active months across history. */
export function activeMonthsStreak(writeups: Writeup[]): number {
  if (!writeups.length) return 0;
  const months = new Set(
    writeups.map((w) => String(w.date).slice(0, 7)),
  );
  const sorted = [...months].sort();
  let best = 1;
  let cur = 1;
  for (let i = 1; i < sorted.length; i++) {
    const [y1, m1] = sorted[i - 1].split("-").map(Number);
    const [y2, m2] = sorted[i].split("-").map(Number);
    const contiguous =
      y1 * 12 + m1 + 1 === y2 * 12 + m2;
    cur = contiguous ? cur + 1 : 1;
    best = Math.max(best, cur);
  }
  return best;
}

/** Build a GitHub-style week grid (Sun-start columns) for the last `weeks` weeks. */
export function buildHeatmapWeeks(
  dates: string[],
  weeks = 26,
  now = new Date(),
) {
  const today = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  );
  // Align the last column to the Sunday of the current week.
  const end = new Date(today);
  end.setDate(end.getDate() - end.getDay());
  const start = new Date(end);
  start.setDate(start.getDate() - (weeks - 1) * 7);

  const counts = new Map<string, number>();
  for (const iso of dates) {
    const day = String(iso).slice(0, 10);
    counts.set(day, (counts.get(day) ?? 0) + 1);
  }

  const localIso = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
      d.getDate(),
    ).padStart(2, "0")}`;

  const out: { label?: string; days: { iso: string; count: number; future?: boolean }[] }[] = [];
  for (let w = 0; w < weeks; w++) {
    const days: { iso: string; count: number; future?: boolean }[] = [];
    let label: string | undefined;
    for (let d = 0; d < 7; d++) {
      const cur = new Date(start);
      cur.setDate(start.getDate() + w * 7 + d);
      const iso = localIso(cur);
      const future = cur.getTime() > today.getTime();
      days.push({ iso, count: counts.get(iso) ?? 0, future });
      if (d === 0 && cur.getDate() <= 7) {
        label = cur.toLocaleDateString("en-US", { month: "short" });
      }
    }
    out.push({ label, days });
  }
  return out;
}

/** All unique tags across writeups + research, sorted by frequency. */
export function allTags(items: { tags: string[] }[]) {
  const counts = new Map<string, number>();
  for (const item of items) {
    for (const tag of item.tags ?? []) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([name, count]) => ({ name, count }));
}
