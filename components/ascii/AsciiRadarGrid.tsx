"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

/**
 * SAO Tactical Hexagonal Grid & Radar Pulse ASCII Animation:
 * - Hexagonal SAO HUD tactical matrix grid pattern
 * - Concentric radar energy waves radiating from cursor position
 * - Ultra-subtle low opacity for perfect readability
 */
export function AsciiRadarGrid({ className }: { className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const preRef = useRef<HTMLPreElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const pre = preRef.current;
    if (!container || !pre) return;

    let cols = 80;
    let rows = 35;
    let elapsed = 0;

    const mousePos = { x: cols / 2, y: rows / 2, targetX: cols / 2, targetY: rows / 2 };

    const onMouseMove = (e: MouseEvent) => {
      const preEl = preRef.current;
      if (!preEl) return;
      
      const rect = preEl.getBoundingClientRect();
      const relX = (e.clientX - rect.left) / rect.width;
      const relY = (e.clientY - rect.top) / rect.height;
      
      mousePos.targetX = relX * cols;
      mousePos.targetY = relY * rows;
    };

    window.addEventListener("mousemove", onMouseMove, { passive: true });

    let rafId: number;

    const measure = () => {
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      if (!w || !h) return;
      const fontSize = Math.max(12, Math.min(18, w / 70));
      pre.style.fontSize = `${fontSize}px`;
      cols = Math.ceil(w / (fontSize * 0.55)) + 12;
      rows = Math.ceil(h / (fontSize * 0.85)) + 12;
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(container);

    // Hex pattern definitions
    const hexPattern = [
      "  / \\_  ",
      "\\_/   \\ ",
      "  \\_/   ",
      " /   \\_ ",
    ];

    const render = () => {
      elapsed += 0.03;

      // Smooth mouse lerp
      mousePos.x += (mousePos.targetX - mousePos.x) * 0.08;
      mousePos.y += (mousePos.targetY - mousePos.y) * 0.08;

      // Calculate radar wave radii
      const wave1 = (elapsed * 5) % 35;
      const wave2 = ((elapsed * 5) + 17.5) % 35;

      let html = "";
      for (let r = 0; r < rows; r++) {
        let line = "";
        let curColor = "";

        const patRow = hexPattern[r % hexPattern.length];

        for (let c = 0; c < cols; c++) {
          const char = patRow[c % patRow.length];
          if (char === " ") {
            if (curColor !== "") {
              line += "</span>";
              curColor = "";
            }
            line += " ";
            continue;
          }

          // Distance to mouse cursor
          const dx = (c - mousePos.x) * 0.65;
          const dy = r - mousePos.y;
          const dist = Math.hypot(dx, dy);

          // Check radar wave proximity
          const dWave1 = Math.abs(dist - wave1);
          const dWave2 = Math.abs(dist - wave2);
          const minWaveDist = Math.min(dWave1, dWave2);

          let col = "rgba(113,113,122,0.22)"; // Default dim steel

          if (minWaveDist < 2.2) {
            const intensity = 1.0 - minWaveDist / 2.2;
            if (intensity > 0.7) {
              col = "#ffffff"; // Pure white highlight
            } else if (intensity > 0.4) {
              col = "#ff2a4b"; // Laser red
            } else {
              col = "rgba(230,0,38,0.6)"; // Crimson glow
            }
          } else if (dist < 4.5) {
            col = "rgba(230,0,38,0.75)"; // Core cursor proximity glow
          }

          if (col !== curColor) {
            if (curColor !== "") line += "</span>";
            line += `<span style="color:${col}">`;
            curColor = col;
          }
          line += char;
        }

        if (curColor !== "") line += "</span>";
        html += line + "\n";
      }

      pre.innerHTML = html;
      rafId = requestAnimationFrame(render);
    };

    rafId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      ro.disconnect();
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={cn("pointer-events-none select-none flex h-full w-full items-center justify-center overflow-hidden", className)}
    >
      <pre
        ref={preRef}
        className="font-mono leading-[0.88] tracking-wider select-none whitespace-pre text-center"
        style={{
          textShadow: "0 0 10px rgba(230,0,38,0.25)",
        }}
      />
    </div>
  );
}
