"use client";

import { cn } from "@/lib/utils";

export type HeatmapWeek = {
  /** Abbreviated month label to show above this column, if any. */
  label?: string;
  days: {
    iso: string;
    count: number;
    future?: boolean;
  }[];
};

/** GitHub-style activity heatmap — rendered from server-computed cells. */
export function HeatmapCalendar({
  weeks,
  monthLabel,
}: {
  weeks: HeatmapWeek[];
  monthLabel?: string;
}) {
  const max = Math.max(1, ...weeks.flatMap((w) => w.days.map((d) => d.count)));

  return (
    <div className="overflow-x-auto pb-1">
      <div className="inline-block">
        {/* Month labels */}
        <div className="flex gap-[3px] pb-1 pl-8">
          {weeks.map((w, i) => (
            <div key={i} className="h-4 w-[13px] shrink-0">
              {w.label ? (
                <span className="font-mono text-[0.6rem] uppercase tracking-wide text-fg3">
                  {w.label}
                </span>
              ) : null}
            </div>
          ))}
        </div>

        <div className="flex gap-[3px]">
          {/* Day labels */}
          <div className="flex w-7 shrink-0 flex-col gap-[3px] pr-1 pt-0.5">
            {["", "Mon", "", "Wed", "", "Fri", ""].map((d, i) => (
              <div
                key={i}
                className="flex h-[13px] items-center font-mono text-[0.55rem] text-fg3"
              >
                {d}
              </div>
            ))}
          </div>

          {weeks.map((w, wi) => (
            <div key={wi} className="flex flex-col gap-[3px]">
              {w.days.map((d) => (
                <span
                  key={d.iso}
                  title={d.future ? undefined : `${d.iso}: ${d.count}`}
                  aria-label={d.future ? undefined : `${d.iso}: ${d.count}`}
                  className={cn(
                    "h-[13px] w-[13px] rounded-[1px]",
                    d.future ? "bg-bg3/40" : "transition-colors",
                  )}
                  style={
                    !d.future && d.count > 0
                      ? {
                          background: `color-mix(in srgb, var(--color-accent) ${
                            25 + Math.round((d.count / max) * 75)
                          }%, var(--color-bg3))`,
                        }
                      : undefined
                  }
                />
              ))}
            </div>
          ))}
        </div>

        {monthLabel ? (
          <p className="sr-only">{monthLabel}</p>
        ) : null}
      </div>
    </div>
  );
}
