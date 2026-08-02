"use client";

import { motion } from "framer-motion";
import { usePathname } from "@/i18n/navigation";
import { FluidCanvas } from "./FluidCanvas";
import { AsciiBackground } from "@/components/ascii/AsciiBackground";
import { useIntroStage } from "@/components/layout/IntroLoader";

/**
 * Global Page Background — Dark Cyber Surrealism / Acid Graphics:
 *   1. Full-screen ASCII Matrix Canvas (Homepage ONLY),
 *   2. Interactive 3D ASCII Wave Background (Subpages),
 *   3. Film grain noise texture overlay across ALL routes,
 *   4. CRT scanlines layer across ALL routes,
 *   5. Corner HUD brackets framing the viewport.
 */
export function Background() {
  const pathname = usePathname();
  const { stage } = useIntroStage();
  const isHome = pathname === "/" || pathname === "";
  const isBgVisible = stage === "full";

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[#09090d]"
    >
      {/* Homepage ASCII Matrix canvas */}
      {isHome && <FluidCanvas />}

      {/* Full-screen ASCII Wave background — rendered across all pages */}
      <AsciiBackground />

      {/* Global Full-Viewport Crimson Vignette & Ambient Glow Overlay */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background:
            "radial-gradient(circle at 50% 35%, rgba(230,0,38,0.22) 0%, rgba(14,14,20,0.55) 55%, rgba(5,5,8,0.92) 100%)",
        }}
      />

      {/* Film grain noise texture overlay across every route */}
      <div aria-hidden className="noise pointer-events-none fixed inset-0 opacity-15 mix-blend-overlay" />

      {/* CRT Scanlines layer across every route */}
      <div aria-hidden className="scanlines pointer-events-none fixed inset-0 opacity-30" />

      {/* Subtle top-left radial glow */}
      <div
        className="pointer-events-none fixed -left-36 -top-36 size-[600px] rounded-full blur-[140px]"
        style={{
          background:
            "radial-gradient(circle, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.015) 45%, transparent 70%)",
        }}
      />

      {/* HUD corner brackets */}
      <span className="corner-bracket corner-bracket--tl" />
      <span className="corner-bracket corner-bracket--tr" />
      <span className="corner-bracket corner-bracket--bl" />
      <span className="corner-bracket corner-bracket--br" />
    </div>
  );
}
