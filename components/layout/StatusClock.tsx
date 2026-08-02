"use client";

import { useEffect, useState } from "react";
import { useLocale } from "next-intl";

/**
 * Live Hanoi clock for the sidebar. Updates every 30s — enough for a
 * status readout without churning React re-renders.
 */
export function StatusClock() {
  const locale = useLocale();
  const [time, setTime] = useState("");

  useEffect(() => {
    const fmt = new Intl.DateTimeFormat(
      locale === "vi" ? "vi-VN" : "en-US",
      {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
        timeZone: "Asia/Ho_Chi_Minh",
      },
    );
    const tick = () => setTime(fmt.format(new Date()));
    tick();
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, [locale]);

  return (
    <div className="flex flex-col items-center gap-1">
      <span className="font-mono text-[0.5rem] uppercase tracking-[0.3em] text-fg3">
        hanoi
      </span>
      <span className="font-mono text-[0.7rem] font-medium tabular-nums text-fg2">
        {time || "--:--"}
      </span>
    </div>
  );
}
