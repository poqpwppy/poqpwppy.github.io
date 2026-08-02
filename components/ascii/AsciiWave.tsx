"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

// Fully populated ASCII character density ramp
const ASCII_RAMP = ".:-=+*#%@";

export function AsciiWave({ className }: { className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const preRef = useRef<HTMLPreElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const pre = preRef.current;
    if (!container || !pre) return;

    let cols = 120;
    let rows = 60;
    let charW = 10;
    let charH = 18;
    let elapsed = 0;

    const mousePos = {
      x: cols / 2,
      y: rows / 2,
      targetX: cols / 2,
      targetY: rows / 2,
      speed: 0,
      lastRawX: 0,
      lastRawY: 0,
    };

    const onMouseMove = (e: MouseEvent) => {
      const w = window.innerWidth;
      const relX = e.clientX / w;

      const rawDist = Math.hypot(e.clientX - mousePos.lastRawX, e.clientY - mousePos.lastRawY);
      mousePos.lastRawX = e.clientX;
      mousePos.lastRawY = e.clientY;
      mousePos.speed = Math.min(1.0, mousePos.speed + rawDist * 0.02);

      mousePos.targetX = Math.max(0, Math.min(cols - 1, relX * cols));
      mousePos.targetY = (e.clientY + window.scrollY) / charH;
    };

    window.addEventListener("mousemove", onMouseMove, { passive: true });

    let rafId: number;

    // Đo chính xác kích thước pixel thực tế của font mono trên trình duyệt
    const measure = () => {
      const w = Math.max(window.innerWidth, document.documentElement.clientWidth || 0);
      const h = Math.max(window.innerHeight, document.documentElement.clientHeight || 0);
      if (!w || !h) return;

      // Font size phóng to (Zoom in): 16px - 22px để sóng ASCII phủ kín toàn màn hình rõ nét
      const fontSize = Math.max(16, Math.min(22, Math.floor(w / 75)));

      const computed = window.getComputedStyle(pre);
      const testSpan = document.createElement("span");
      testSpan.style.fontSize = `${fontSize}px`;
      testSpan.style.fontFamily = computed.fontFamily || "var(--font-mono), monospace";
      testSpan.style.lineHeight = "1";
      testSpan.style.position = "absolute";
      testSpan.style.visibility = "hidden";
      testSpan.style.whiteSpace = "pre";
      testSpan.innerText = "X";
      document.body.appendChild(testSpan);

      const rect = testSpan.getBoundingClientRect();
      charW = rect.width || (fontSize * 0.6);
      charH = rect.height || (fontSize * 1.1);
      document.body.removeChild(testSpan);

      // Tính toán vừa khít viewport không làm dư thừa chiều cao gây lề dưới footer
      cols = Math.ceil(w / charW);
      rows = Math.ceil(h / charH);

      pre.style.width = "100%";
      pre.style.height = "100%";
      pre.style.fontSize = `${fontSize}px`;
      pre.style.lineHeight = `${charH}px`;
      pre.style.letterSpacing = "0px";
      pre.style.margin = "0";
      pre.style.padding = "0";
    };

    measure();
    window.addEventListener("resize", measure);

    if (typeof document !== "undefined" && document.fonts) {
      document.fonts.ready.then(measure);
    }

    const render = () => {
      elapsed += 0.035;

      mousePos.x += (mousePos.targetX - mousePos.x) * 0.1;
      mousePos.y += (mousePos.targetY - mousePos.y) * 0.1;
      mousePos.speed *= 0.94;

      const rowScroll = window.scrollY / charH;

      let html = "";
      for (let r = 0; r < rows; r++) {
        const row = r + rowScroll;
        let line = "";
        let curColor = "";

        for (let c = 0; c < cols; c++) {
          // Tần số sóng mượt & to (Zoomed wave parameters)
          const w1 = Math.sin(c * 0.04 + elapsed * 1.2);
          const w2 = Math.cos(row * 0.07 - elapsed * 1.5);
          const w3 = Math.sin((c + row) * 0.03 + elapsed * 0.9);

          const dx = (c - mousePos.x) * 0.6;
          const dy = row - mousePos.y;
          const distToMouse = Math.hypot(dx, dy);

          const ripple = Math.sin(distToMouse * 0.35 - elapsed * 3.5) * Math.exp(-distToMouse * 0.06) * (0.8 + mousePos.speed * 2.0);

          const totalHeight = (w1 * 0.35 + w2 * 0.35 + w3 * 0.3 + ripple * 0.8 + 1.2) / 2.4;
          const clampedH = Math.max(0, Math.min(0.99, totalHeight));

          const charIdx = Math.floor(clampedH * ASCII_RAMP.length);
          const char = ASCII_RAMP[charIdx];

          let col = "rgba(220, 30, 50, 0.45)";
          if (clampedH > 0.80) {
            col = "rgba(255, 160, 175, 0.98)";
          } else if (clampedH > 0.60) {
            col = "rgba(255, 50, 80, 0.85)";
          } else if (clampedH > 0.35) {
            col = "rgba(230, 10, 45, 0.65)";
          } else if (distToMouse < 8.0) {
            col = "rgba(255, 80, 100, 0.95)";
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
      window.removeEventListener("resize", measure);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={cn("pointer-events-none select-none fixed inset-0 w-full h-full max-w-full max-h-full overflow-hidden -z-10", className)}
    >
      <pre
        ref={preRef}
        className="absolute inset-0 m-0 p-0 font-mono select-none whitespace-pre text-left font-normal overflow-hidden leading-none pointer-events-none w-full h-full"
        style={{
          textShadow: "0 0 14px rgba(230,0,38,0.55)",
        }}
      />
    </div>
  );
}

