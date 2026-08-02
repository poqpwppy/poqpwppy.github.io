"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

type Node = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  char: string;
  color: string;
};

const NODE_CHARS = ["+", "*", "#", "@", "x", "o"];
const NODE_COLORS = ["#ff2a4b", "#e60026", "#ffffff", "#a1a1aa", "#71717a"];

export function AsciiNetwork({ className }: { className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const preRef = useRef<HTMLPreElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const pre = preRef.current;
    if (!container || !pre) return;

    let cols = 80;
    let rows = 35;

    // Nodes initialization
    const numNodes = 42;
    const nodes: Node[] = [];

    for (let i = 0; i < numNodes; i++) {
      nodes.push({
        x: Math.random() * (cols - 4) + 2,
        y: Math.random() * (rows - 4) + 2,
        vx: (Math.random() - 0.5) * 0.12,
        vy: (Math.random() - 0.5) * 0.12,
        char: NODE_CHARS[Math.floor(Math.random() * NODE_CHARS.length)],
        color: NODE_COLORS[Math.floor(Math.random() * NODE_COLORS.length)],
      });
    }

    const mousePos = { x: cols / 2, y: rows / 2, targetX: cols / 2, targetY: rows / 2 };

    const onMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const relX = (e.clientX - rect.left) / rect.width;
      const relY = (e.clientY - rect.top) / rect.height;
      mousePos.targetX = Math.max(0, Math.min(cols - 1, relX * cols));
      mousePos.targetY = Math.max(0, Math.min(rows - 1, relY * rows));
    };

    window.addEventListener("mousemove", onMouseMove, { passive: true });

    let rafId: number;

    const measure = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      if (!w || !h) return;
      const fontSize = Math.max(9, Math.min(14, w / 75));
      pre.style.fontSize = `${fontSize}px`;
      cols = Math.max(30, Math.floor(w / (fontSize * 0.65)));
      rows = Math.max(15, Math.floor(h / (fontSize * 1.1)));
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(container);

    const render = () => {
      // Lerp mouse position
      mousePos.x += (mousePos.targetX - mousePos.x) * 0.08;
      mousePos.y += (mousePos.targetY - mousePos.y) * 0.08;

      // Grid buffer initialization
      const gridChar: string[][] = Array.from({ length: rows }, () => Array(cols).fill(" "));
      const gridColor: string[][] = Array.from({ length: rows }, () => Array(cols).fill("#3f3f46"));

      // Update nodes
      nodes.forEach((node) => {
        // Subtle mouse attraction
        const dxM = mousePos.x - node.x;
        const dyM = mousePos.y - node.y;
        const distM = Math.hypot(dxM, dyM);
        if (distM < 16 && distM > 0.1) {
          node.vx += (dxM / distM) * 0.006;
          node.vy += (dyM / distM) * 0.006;
        }

        // Speed dampening
        node.vx *= 0.98;
        node.vy *= 0.98;

        node.x += node.vx;
        node.y += node.vy;

        // Bounce on boundaries
        if (node.x < 1 || node.x > cols - 2) node.vx *= -1;
        if (node.y < 1 || node.y > rows - 2) node.vy *= -1;

        node.x = Math.max(1, Math.min(cols - 2, node.x));
        node.y = Math.max(1, Math.min(rows - 2, node.y));

        const r = Math.round(node.y);
        const c = Math.round(node.x);
        if (r >= 0 && r < rows && c >= 0 && c < cols) {
          gridChar[r][c] = node.char;
          gridColor[r][c] = node.color;
        }
      });

      // Draw connections between close nodes
      const maxConnectDist = 13;
      const activeNodes = [...nodes, { x: mousePos.x, y: mousePos.y, char: "@", color: "#ff2a4b", vx: 0, vy: 0 }];

      for (let i = 0; i < activeNodes.length; i++) {
        for (let j = i + 1; j < activeNodes.length; j++) {
          const n1 = activeNodes[i];
          const n2 = activeNodes[j];
          const dx = n2.x - n1.x;
          const dy = n2.y - n1.y;
          const dist = Math.hypot(dx, dy);

          if (dist < maxConnectDist && dist > 1) {
            const steps = Math.ceil(dist * 1.4);
            for (let s = 1; s < steps; s++) {
              const t = s / steps;
              const lx = Math.round(n1.x + dx * t);
              const ly = Math.round(n1.y + dy * t);

              if (ly >= 0 && ly < rows && lx >= 0 && lx < cols) {
                if (gridChar[ly][lx] === " ") {
                  gridChar[ly][lx] = dist < 6 ? "." : ":";
                  gridColor[ly][lx] = dist < 6 ? "rgba(230,0,38,0.5)" : "rgba(113,113,122,0.35)";
                }
              }
            }
          }
        }
      }

      // Generate HTML string
      let html = "";
      for (let r = 0; r < rows; r++) {
        let line = "";
        let curColor = "";
        for (let c = 0; c < cols; c++) {
          const ch = gridChar[r][c];
          const col = gridColor[r][c];
          if (ch === " ") {
            if (curColor !== "") {
              line += "</span>";
              curColor = "";
            }
            line += " ";
          } else {
            if (col !== curColor) {
              if (curColor !== "") line += "</span>";
              line += `<span style="color:${col}">`;
              curColor = col;
            }
            line += ch;
          }
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
        className="font-mono leading-[0.9] tracking-wider text-neutral-400 select-none whitespace-pre text-center"
        style={{
          textShadow: "0 0 12px rgba(230,0,38,0.35)",
        }}
      />
    </div>
  );
}
