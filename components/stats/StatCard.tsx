import type { ReactNode } from "react";
import { cn, formatNumber } from "@/lib/utils";

type StatCardProps = {
  label: string;
  value: number;
  unit?: string;
  icon?: ReactNode;
  locale: string;
  accent?: boolean;
  className?: string;
};

/** Single metric card in the stats dashboard. */
export function StatCard({
  label,
  value,
  unit,
  icon,
  locale,
  accent,
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        "group relative overflow-hidden border border-[#e60026]/45 bg-[#160306]/90 p-5 backdrop-blur-xl shadow-[0_0_22px_rgba(230,0,38,0.22)] transition-all duration-500 hover:border-[#e60026] hover:bg-[#1a0005]/95 hover:shadow-[0_0_38px_rgba(230,0,38,0.5)] transform-gpu",
        accent && "border-[#e60026]/70 bg-[#1a0005]/90 shadow-[0_0_24px_rgba(230,0,38,0.35)]",
        className,
      )}
    >
      {/* HUD Top-Left Corner Bracket */}
      <span
        aria-hidden
        className="absolute left-0 top-0 h-3 w-3 border-l-2 border-t-2 border-[#e60026] shadow-[0_0_8px_#e60026]"
      />

      {/* HUD Bottom-Right Corner Bracket */}
      <span
        aria-hidden
        className="absolute bottom-0 right-0 h-3 w-3 border-b-2 border-r-2 border-[#e60026] shadow-[0_0_8px_#e60026]"
      />

      <div className="flex items-center justify-between font-mono">
        <p className="text-[0.65rem] font-black uppercase tracking-widest text-[#e60026]">
          [{label}]
        </p>
        {icon ? (
          <span className="text-[#e60026]" aria-hidden>
            {icon}
          </span>
        ) : null}
      </div>
      <p
        className={cn(
          "font-mono mt-3 text-3xl font-black tabular-nums text-white md:text-4xl",
          accent && "text-[#e60026]"
        )}
      >
        {formatNumber(value, locale)}
        {unit ? (
          <span className="ml-1 text-lg font-bold text-neutral-400">{unit}</span>
        ) : null}
      </p>
    </div>
  );
}
