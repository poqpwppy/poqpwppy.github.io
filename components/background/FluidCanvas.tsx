"use client";

import { useEffect, useRef } from "react";

const MATRIX_CHARS =
  "01010101ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz#@$%&*+=-~:;<>?/\\|{}[]0x410x00";

// Fast 2D Perlin Noise Implementation
class Perlin2D {
  private p: number[] = new Array(512);

  constructor() {
    const permutation = [
      151, 160, 137, 91, 90, 15, 131, 13, 201, 95, 96, 53, 194, 233, 7, 225,
      140, 36, 103, 30, 69, 142, 8, 99, 37, 240, 21, 10, 23, 190, 6, 148, 247,
      120, 234, 75, 0, 26, 197, 62, 94, 252, 219, 203, 117, 35, 11, 32, 57, 177,
      33, 88, 237, 149, 56, 87, 174, 20, 125, 136, 171, 168, 68, 175, 74, 165, 71,
      134, 139, 48, 27, 166, 77, 146, 158, 231, 83, 111, 229, 122, 60, 211, 133,
      230, 220, 105, 92, 41, 55, 46, 245, 40, 244, 102, 143, 54, 65, 25, 63, 161,
      1, 216, 80, 73, 209, 76, 132, 187, 208, 89, 18, 169, 200, 196, 135, 130, 116,
      188, 159, 86, 164, 100, 109, 198, 173, 186, 3, 64, 52, 217, 226, 250, 124,
      123, 5, 202, 38, 147, 118, 126, 255, 82, 85, 212, 207, 206, 59, 227, 47,
      16, 58, 17, 182, 189, 28, 42, 223, 183, 170, 213, 119, 248, 152, 2, 44,
      145, 31, 179, 228, 165, 55, 110, 178, 224, 184, 205, 195, 193, 121, 176, 78,
      167, 241, 180, 84, 39, 18, 251, 192, 246, 14, 79, 81, 141, 138, 153, 51,
      144, 34, 242, 193, 238, 210, 144, 12, 191, 172, 70, 249, 157, 156, 72, 215,
      97, 32, 24, 150, 154, 67, 114, 61, 66, 214, 222, 115, 123, 113, 49, 112,
      232, 19, 45, 218, 128, 155, 163, 81,
    ];
    for (let i = 0; i < 256; i++) {
      this.p[i] = permutation[i % permutation.length];
      this.p[256 + i] = this.p[i];
    }
  }

  private fade(t: number) {
    return t * t * t * (t * (t * 6 - 15) + 10);
  }

  private lerp(t: number, a: number, b: number) {
    return a + t * (b - a);
  }

  private grad(hash: number, x: number, y: number) {
    const h = hash & 7;
    const u = h < 4 ? x : y;
    const v = h < 4 ? y : x;
    return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
  }

  public noise(x: number, y: number) {
    const X = Math.floor(x) & 255;
    const Y = Math.floor(y) & 255;
    x -= Math.floor(x);
    y -= Math.floor(y);
    const u = this.fade(x);
    const v = this.fade(y);
    const A = this.p[X] + Y;
    const B = this.p[X + 1] + Y;

    return this.lerp(
      v,
      this.lerp(
        u,
        this.grad(this.p[A], x, y),
        this.grad(this.p[B], x - 1, y)
      ),
      this.lerp(
        u,
        this.grad(this.p[A + 1], x, y - 1),
        this.grad(this.p[B + 1], x - 1, y - 1)
      )
    );
  }
}

/**
 * AsciiMatrixCanvas — HTML5 Canvas render ASCII Matrix driven by Perlin Noise.
 * Features:
 *   1. Perlin Noise density modulation for smooth organic stream flows.
 *   2. ASCII Cursor Ring trailing the mouse pointer.
 *   3. HOVER Interaction: Hovering any UI element (button, card, text) causes
 *      ASCII background characters behind it to scramble rapidly and ignite with an
 *      intense Neon Green Glow (#00ff66).
 */
export function FluidCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number | null>(null);
  const mouseRef = useRef({ x: -500, y: -500, isHovered: false });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const perlin = new Perlin2D();

    let fontSize = 14;
    let columns = 0;
    let drops: number[] = [];

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.0);
      canvas.width = Math.floor(window.innerWidth * dpr);
      canvas.height = Math.floor(window.innerHeight * dpr);
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;

      fontSize = Math.max(12, Math.floor(window.innerWidth / 90));
      columns = Math.floor(canvas.width / fontSize);
      drops = new Array(columns).fill(1).map(() => Math.floor(Math.random() * -50));
    };

    resize();
    window.addEventListener("resize", resize);
    const onMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
      mouseRef.current.isHovered = true;
    };

    window.addEventListener("mousemove", onMove, { passive: true });

    let lastTime = performance.now();
    const FRAME_INTERVAL = 1000 / 30; // 30 FPS cap for smooth animation

    const render = (now: number) => {
      if (now - lastTime < FRAME_INTERVAL) {
        rafRef.current = requestAnimationFrame(render);
        return;
      }
      lastTime = now;

      // Dark fade with vibrant trail persistence
      ctx.fillStyle = "rgba(9, 9, 13, 0.16)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.font = `${fontSize}px monospace`;

      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;
      const timeSec = now * 0.00045;

      for (let i = 0; i < drops.length; i++) {
        const x = i * fontSize;
        const y = Math.floor(drops[i]) * fontSize;

        const nVal = perlin.noise(i * 0.08, drops[i] * 0.08 + timeSec);
        const normN = (nVal + 1) / 2;

        const dist = Math.hypot(x - mx, y - my);
        const inHoverZone = dist < 160;

        const STREAK = 6;
        for (let k = 0; k < STREAK; k++) {
          const ty = y - k * fontSize;
          if (ty < 0) continue;

          // Scramble characters rapidly when mouse is nearby
          const charIdx = inHoverZone
            ? Math.floor(Math.random() * MATRIX_CHARS.length)
            : Math.floor((normN * 30 + (rIdx(i, k))) % MATRIX_CHARS.length);

          const char = MATRIX_CHARS[Math.abs(charIdx) % MATRIX_CHARS.length];

          // High vibrancy red alpha
          let alpha = k === 0
            ? Math.max(0.75, normN * 0.98)
            : Math.max(0.20, (1 - k / STREAK) * 0.7 * normN);

          if (inHoverZone) {
            alpha = Math.min(1.0, alpha + (1 - dist / 160) * 0.5);
          }

          ctx.fillStyle = inHoverZone ? "rgba(255, 60, 90, 0.98)" : `rgba(230, 0, 38, ${alpha})`;
          ctx.shadowColor = inHoverZone ? "#ff2a4b" : "#e60026";
          ctx.shadowBlur = inHoverZone ? 18 : (k === 0 ? 14 : 6);

          ctx.fillText(char, x, ty);
        }

        if (y > canvas.height && Math.random() > (0.96 - normN * 0.03)) {
          drops[i] = 0;
        }
        drops[i] += 0.85;
      }

      // ASCII Cursor Ring removed per user request

      rafRef.current = requestAnimationFrame(render);
    };

    function rIdx(col: number, streakIdx: number) {
      return (col * 17 + streakIdx * 3) % MATRIX_CHARS.length;
    }

    rafRef.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none fixed inset-0"
    />
  );
}
