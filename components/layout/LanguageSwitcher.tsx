"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

/**
 * Toggles between vi/en, preserving the current page and its query
 * string. Wrapped in Suspense because it reads search params (required
 * for static rendering in React 19).
 */
const LOCALE_LABELS: Record<string, string> = {
  vi: "VIETNAMESE",
  en: "ENGLISH",
};

export function LanguageSwitcher({
  variant = "floating-dock",
}: {
  variant?: "default" | "minimal-split" | "circle-split" | "floating-dock";
}) {
  return (
    <Suspense fallback={<span className="font-mono text-xs text-neutral-500">VI</span>}>
      <SwitcherInner variant={variant} />
    </Suspense>
  );
}

function SwitcherInner({ variant }: { variant?: "default" | "minimal-split" | "circle-split" | "floating-dock" }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const current = useLocale();

  function switchLocale(next: string) {
    const query = searchParams?.toString();
    const href = query ? `${pathname}?${query}` : pathname;
    router.replace(href, { locale: next });
  }

  if (variant === "floating-dock") {
    return (
      <div
        className="relative flex items-center gap-1 rounded-sm border border-[#e60026]/40 bg-[#0a0a0d]/95 p-1 font-mono text-[0.72rem] font-bold uppercase tracking-widest backdrop-blur-2xl shadow-[0_0_30px_rgba(230,0,38,0.18)] transition-all hover:border-[#e60026]"
        role="group"
        aria-label="Language"
      >
        {/* HUD corner brackets */}
        <span aria-hidden className="absolute left-0 top-0 h-2 w-2 border-l border-t border-[#e60026]" />
        <span aria-hidden className="absolute right-0 bottom-0 h-2 w-2 border-r border-b border-[#e60026]" />

        {routing.locales.map((loc) => {
          const active = loc === current;
          const label = loc === "vi" ? "VIETNAMESE" : "ENGLISH";
          return (
            <button
              key={loc}
              type="button"
              onClick={() => switchLocale(loc)}
              aria-pressed={active}
              className={`cursor-pointer rounded-[2px] px-3.5 py-1.5 transition-all duration-300 ${
                active
                  ? "bg-[#e60026] text-white font-black shadow-[0_0_12px_rgba(230,0,38,0.8)]"
                  : "text-neutral-400 hover:text-white hover:bg-neutral-900/80"
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>
    );
  }

  if (variant === "circle-split") {
    return (
      <div
        className="relative flex h-28 w-28 sm:h-32 sm:w-32 items-center justify-center rounded-full border border-neutral-700/80 bg-transparent font-mono text-[0.58rem] sm:text-[0.68rem] font-black uppercase tracking-wider overflow-hidden backdrop-blur-sm"
        role="group"
        aria-label="Language"
      >
        {/* Center Hairline Divider */}
        <span aria-hidden className="absolute inset-y-0 left-1/2 w-[1px] -translate-x-1/2 bg-neutral-700/80 z-10 pointer-events-none" />

        {routing.locales.map((loc, idx) => {
          const active = loc === current;
          const label = LOCALE_LABELS[loc] || loc.toUpperCase();

          return (
            <button
              key={loc}
              type="button"
              onClick={() => switchLocale(loc)}
              aria-pressed={active}
              className={`cursor-pointer h-full w-1/2 flex items-center justify-center text-center transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                idx === 0 ? "pr-1 pl-1 rounded-l-full" : "pl-1 pr-1 rounded-r-full"
              } ${
                active
                  ? "text-[#e60026] bg-white/5 font-black drop-shadow-[0_0_10px_rgba(230,0,38,0.9)]"
                  : "text-neutral-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <span className="truncate max-w-full px-0.5">{label}</span>
            </button>
          );
        })}
      </div>
    );
  }

  if (variant === "minimal-split") {
    return (
      <div
        className="flex items-center divide-x divide-neutral-700/80 rounded-full border border-neutral-700/80 bg-transparent font-mono text-xs font-bold uppercase tracking-wider overflow-hidden backdrop-blur-md shadow-xl"
        role="group"
        aria-label="Language"
      >
        {routing.locales.map((loc) => {
          const active = loc === current;
          return (
            <button
              key={loc}
              type="button"
              onClick={() => switchLocale(loc)}
              aria-pressed={active}
              className={`cursor-pointer h-9 w-9 sm:h-11 sm:w-11 flex items-center justify-center transition-all duration-300 ${
                active
                  ? "bg-[#e60026] text-white font-black shadow-[0_0_16px_rgba(230,0,38,0.85)]"
                  : "text-neutral-400 hover:text-white hover:bg-neutral-900/60"
              }`}
            >
              {loc}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div
      className="flex items-center gap-0.5 rounded-sm border border-line bg-bg2 p-0.5 font-mono text-[0.68rem] font-semibold uppercase tracking-[0.08em]"
      role="group"
      aria-label="Language"
    >
      {routing.locales.map((loc) => {
        const active = loc === current;
        return (
          <button
            key={loc}
            type="button"
            onClick={() => switchLocale(loc)}
            aria-pressed={active}
            className={`cursor-pointer rounded-[1px] px-2 py-1 transition-colors ${
              active
                ? "bg-white text-black font-bold"
                : "text-fg3 hover:text-fg2"
            }`}
          >
            {loc}
          </button>
        );
      })}
    </div>
  );
}
