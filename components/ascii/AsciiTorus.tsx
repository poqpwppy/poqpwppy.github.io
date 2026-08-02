"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

const RAMP = " .:-=+*#%@";
const CHROME = [
  "",
  "#27272a",
  "#3f3f46",
  "#52525b",
  "#71717a",
  "#a1a1aa",
  "#d4d4d8",
  "#e4e4e7",
  "#f4f4f5",
  "#ffffff",
];

const TAU = Math.PI * 2;

type Frame = {
  buf: Uint8Array;
  zbuf: Float32Array;
  cols: number;
  rows: number;
};

function allocFrame(cols: number, rows: number): Frame {
  return {
    buf: new Uint8Array(cols * rows),
    zbuf: new Float32Array(cols * rows).fill(-Infinity),
    cols,
    rows,
  };
}

function renderFrame(elapsed: number, rotX: number, rotY: number, frame: Frame): Frame {
  const { cols, rows, buf, zbuf } = frame;
  const total = cols * rows;
  zbuf.fill(-Infinity);
  buf.fill(0);

  const R = 1.4;
  const r0 = 0.55;
  const K2 = 5;
  const K1 = ((cols * 0.75) * K2 * 3) / (8 * (R + r0));

  const A = elapsed * 0.4 + rotY * 1.5;
  const B = elapsed * 0.2 + rotX * 1.5;
  const C = elapsed * 0.08;
  const cosA = Math.cos(A), sinA = Math.sin(A);
  const cosB = Math.cos(B), sinB = Math.sin(B);
  const cosC = Math.cos(C), sinC = Math.sin(C);

  const LX = 0.6, LY = -0.8, LZ = 0.45;

  for (let t = 0; t < TAU; t += 0.09) {
    const cosT = Math.cos(t), sinT = Math.sin(t);
    for (let p = 0; p < TAU; p += 0.18) {
      const cosP = Math.cos(p), sinP = Math.sin(p);

      const x1 = (R + r0 * cosP) * cosT;
      const y1 = (R + r0 * cosP) * sinT;
      const z1 = r0 * sinP;

      const x2 = x1 * cosA + z1 * sinA;
      const z2 = -x1 * sinA + z1 * cosA;
      const y3 = y1 * cosB - z2 * sinB;
      const z3 = y1 * sinB + z2 * cosB;
      const x4 = x2 * cosC - y3 * sinC;
      const y4 = x2 * sinC + y3 * cosC;

      const nx1 = cosP * cosT;
      const ny1 = cosP * sinT;
      const nz1 = sinP;
      const nx2 = nx1 * cosA + nz1 * sinA;
      const nz2 = -nx1 * sinA + nz1 * cosA;
      const ny3 = ny1 * cosB - nz2 * sinB;
      const nz3 = ny1 * sinB + nz2 * cosB;
      const nx4 = nx2 * cosC - ny3 * sinC;
      const ny4 = nx2 * sinC + ny3 * cosC;
      const nz4 = nz3;

      const lum = nx4 * LX + ny4 * LY + nz4 * LZ;
      const ooz = 1 / (z3 + K2);

      const xp = Math.round(cols / 2 + K1 * x4 * ooz);
      const yp = Math.round(rows / 2 - K1 * y4 * ooz);
      const idx = xp + yp * cols;
      if (idx >= 0 && idx < total && ooz > zbuf[idx]) {
        zbuf[idx] = ooz;
        const shade = Math.max(0, Math.min(0.99, lum * 0.5 + 0.55));
        buf[idx] = 1 + Math.floor(shade * 8.999);
      }
    }
  }
  return frame;
}

function toHtml({ buf, cols }: Frame): string {
  let html = "";
  let cur: string | null = null;
  for (let i = 0; i < buf.length; i++) {
    const v = buf[i];
    if (v === 0) {
      if (cur !== null) {
        html += "</span>";
        cur = null;
      }
      html += " ";
    } else {
      const color = CHROME[v];
      if (color !== cur) {
        if (cur !== null) html += "</span>";
        html += `<span style="color:${color}">`;
        cur = color;
      }
      html += RAMP[v];
    }
    if (i % cols === cols - 1) {
      if (cur !== null) {
        html += "</span>";
        cur = null;
      }
      html += "\n";
    }
  }
  return html;
}

type AsciiTorusProps = {
  className?: string;
  label?: string;
  isGlobalMouse?: boolean;
};

export function AsciiTorus({
  className,
  label = "3D :: ASCII :: TORUS",
  isGlobalMouse = false,
}: AsciiTorusProps) {
  const boxRef = useRef<HTMLDivElement>(null);
  const preRef = useRef<HTMLPreElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const mouseRotRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

  // Global mouse position tracking when rendered in background
  useEffect(() => {
    if (!isGlobalMouse) return;

    const onGlobalMouseMove = (e: MouseEvent) => {
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      const normX = (e.clientX - cx) / cx;
      const normY = (e.clientY - cy) / cy;
      mouseRotRef.current.targetX = normY * 1.5;
      mouseRotRef.current.targetY = normX * 1.5;
    };

    window.addEventListener("mousemove", onGlobalMouseMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", onGlobalMouseMove);
    };
  }, [isGlobalMouse]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isGlobalMouse || !boxRef.current) return;
    const rect = boxRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const normX = (e.clientX - cx) / (rect.width / 2);
    const normY = (e.clientY - cy) / (rect.height / 2);
    mouseRotRef.current.targetX = normY * 1.2;
    mouseRotRef.current.targetY = normX * 1.2;
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (!isGlobalMouse) {
      mouseRotRef.current.targetX = 0;
      mouseRotRef.current.targetY = 0;
    }
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  useEffect(() => {
    const box = boxRef.current;
    const pre = preRef.current;
    if (!box || !pre) return;

    let cols = 44;
    let rows = 18;
    let elapsed = 0;
    let lastTime: number | null = null;
    let accumulator = 0;
    const FRAME_DT = 1 / 30; // 30 FPS cap
    let rafId: number | null = null;
    let fb: Frame = allocFrame(cols, rows);

    const measure = () => {
      const w = box.clientWidth;
      const h = box.clientHeight;
      if (!w || !h) return;
      const fs = Math.max(8, Math.min(13, w / 65));
      pre.style.fontSize = `${fs}px`;
      cols = Math.max(24, Math.floor(w / (fs * 0.65)));
      rows = Math.max(12, Math.floor(h / (fs * 0.95)));
      fb = allocFrame(cols, rows);
    };

    const draw = (time: number) => {
      if (lastTime !== null) {
        const dt = Math.min((time - lastTime) / 1000, 0.1);
        elapsed += dt;
        accumulator += dt;
      }
      lastTime = time;

      // Smooth lerp mouse rotation
      const m = mouseRotRef.current;
      m.x += (m.targetX - m.x) * 0.1;
      m.y += (m.targetY - m.y) * 0.1;

      if (accumulator >= FRAME_DT) {
        accumulator %= FRAME_DT;
        pre.innerHTML = toHtml(renderFrame(elapsed, m.x, m.y, fb));
      }
      rafId = requestAnimationFrame(draw);
    };

    measure();

    const ro = new ResizeObserver(() => measure());
    ro.observe(box);

    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        if (rafId === null) {
          lastTime = null;
          rafId = requestAnimationFrame(draw);
        }
      } else {
        if (rafId !== null) {
          cancelAnimationFrame(rafId);
          rafId = null;
        }
      }
    });
    io.observe(box);

    return () => {
      ro.disconnect();
      io.disconnect();
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={cn(
        "relative rounded-sm border transition-colors duration-300 bg-black/80 p-4 shadow-xl backdrop-blur-xl cursor-crosshair group",
        isHovered ? "border-[#e60026]/70 shadow-[0_0_25px_rgba(230,0,38,0.25)]" : "border-neutral-800",
        className
      )}
    >
      {label && (
        <div className="mb-2 flex items-center justify-between font-mono text-[0.65rem] uppercase tracking-[0.2em] text-neutral-400">
          <span className="flex items-center gap-1.5 font-bold text-white">
            <span
              aria-hidden
              className={cn(
                "h-1.5 w-1.5 rounded-full transition-colors duration-300",
                isHovered ? "bg-[#e60026] animate-ping" : "bg-white animate-pulse"
              )}
            />
            {label}
          </span>
          <span className={cn("transition-colors duration-300", isHovered ? "text-[#e60026]" : "")}>
            {isHovered ? "[ INTERACTIVE 3D :: MOUSE CONTROL ]" : "3D :: Z-BUFFER"}
          </span>
        </div>
      )}

      <div ref={boxRef} aria-hidden className="flex h-full w-full items-center justify-center overflow-hidden">
        <pre
          ref={preRef}
          className="select-none whitespace-pre text-center font-mono leading-[0.88] tracking-widest text-white transition-all duration-300"
          style={{
            textShadow:
              isHovered || isGlobalMouse
                ? "0 0 16px rgba(230,0,38,0.85), 0 0 30px rgba(255,255,255,0.4)"
                : "0 0 10px rgba(255,255,255,0.3)",
          }}
        />
      </div>
    </div>
  );
}
