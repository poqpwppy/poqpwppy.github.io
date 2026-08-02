import { cn, formatNumber } from "@/lib/utils";

type Stat = { label: string; value: number; unit?: string };

/** Full-bleed stat band — mono labels, oversized display numbers. */
export function StatsStrip({
  stats,
  locale,
  className,
}: {
  stats: Stat[];
  locale: string;
  className?: string;
}) {
  return (
    <section
      aria-label="stats"
      className={cn("border-y border-line", className)}
    >
      <div className="container-page grid grid-cols-2 lg:grid-cols-4">
        {stats.map((s, i) => (
          <div
            key={s.label}
            className={cn(
              "px-4 py-8 md:px-6 md:py-12",
              i % 2 === 1 && "border-l border-line",
              i >= 2 && "border-t border-line lg:border-t-0",
              i === 2 && "lg:border-l",
              i === 3 && "lg:border-l",
            )}
          >
            <p className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-fg3">
              {s.label}
            </p>
            <p className="font-display mt-2 text-4xl font-extrabold tabular-nums text-fg md:text-5xl">
              {formatNumber(s.value, locale)}
              {s.unit ? (
                <span className="ml-1 text-xl font-semibold text-fg3 md:text-2xl">
                  {s.unit}
                </span>
              ) : null}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
