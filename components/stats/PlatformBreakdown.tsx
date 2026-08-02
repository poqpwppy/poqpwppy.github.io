import { getTranslations } from "next-intl/server";
import { PLATFORM_COLORS } from "@/lib/constants";
import { formatNumber } from "@/lib/utils";

type PlatformStat = {
  platform: "hackthebox" | "tryhackme" | "ctftime" | "rootme";
  points: number;
  rank?: number;
  solves?: number;
  url?: string;
};

/** Horizontal bar list per platform — pure server markup, no chart lib. */
export async function PlatformBreakdown({
  platforms,
  locale,
}: {
  platforms: PlatformStat[];
  locale: string;
}) {
  const tax = await getTranslations({ locale, namespace: "taxonomies" });
  const maxPoints = Math.max(1, ...platforms.map((p) => p.points));

  return (
    <div className="space-y-4">
      {platforms.map((p) => {
        const pct = Math.round((p.points / maxPoints) * 100);
        const color = PLATFORM_COLORS[p.platform] ?? "#8b8b94";
        return (
          <div key={p.platform}>
            <div className="mb-1.5 flex items-baseline justify-between gap-3 font-mono text-[0.72rem]">
              <span className="flex items-center gap-2 text-fg2">
                <span
                  aria-hidden
                  className="h-1.5 w-1.5"
                  style={{ background: color }}
                />
                {tax(`platform.${p.platform}`)}
              </span>
              <span className="text-fg3">
                {formatNumber(p.points, locale)} pts
              </span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-[1px] bg-bg3">
              <div
                className="h-full"
                style={{
                  width: `${pct}%`,
                  background: `color-mix(in srgb, ${color} 85%, var(--color-bg))`,
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
