"use client";

import { AsciiWave } from "@/components/ascii/AsciiWave";

/**
 * Ambient Subtle Background ASCII Animation Component:
 * - Full-page interactive ASCII Water Wave animation (Sóng Nước ASCII)
 * - The wave is anchored to the PAGE (scrolls with the content), so it flows
 *   across the ENTIRE page height — not just the initial viewport — while the
 *   rendered grid stays viewport-sized (zero extra cells, no lag)
 * - Brightened atmospheric crimson red tones with opacity-[0.28]
 * - Interactive cursor-tracking liquid ripple physics
 * - Zero pointer events so scrolling & text selection work 100% unimpeded
 */
export function AsciiBackground() {
  return (
    <div
      aria-hidden
      className="pointer-events-none select-none fixed inset-0 w-screen h-screen -z-10 overflow-hidden opacity-50"
    >
      {/* Ambient radial red backdrop glow */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(230,0,38,0.20)_0%,transparent_85%)]" />
      <AsciiWave />
    </div>
  );
}

