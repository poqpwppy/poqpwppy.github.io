"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Sci-Fi Cyber Red Dot Custom Cursor Component.
 * - Desktop only: renders nothing on touch-only devices (phones, tablets).
 * - Direct zero-latency hardware tracking centered on pointer.
 * - Luminous crimson red dot with ambient glow.
 * - Expands into a glowing HUD pulse ring with inner core when hovering interactive elements.
 * - Scales down smoothly on mouse click.
 */
export function HudCursor() {
  const [enabled, setEnabled] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);
  const [visible, setVisible] = useState(false);

  const dotRef = useRef<HTMLDivElement>(null);

  // Show the custom cursor only when the primary input is a fine pointer
  // (mouse/trackpad). On touch-only devices there is no cursor to replace —
  // the dot would otherwise trail the finger. Updates live if the pointer
  // type changes (e.g. plugging/unplugging a mouse on a touchscreen laptop).
  useEffect(() => {
    const mq = window.matchMedia("(pointer: fine)");
    const apply = () => setEnabled(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const dot = dotRef.current;
    if (!dot) return;

    let posX = -100;
    let posY = -100;
    let targetX = -100;
    let targetY = -100;
    let rafId: number | null = null;

    const render = () => {
      // Smooth lerp (0.5 for ultra-responsive tracking)
      posX += (targetX - posX) * 0.5;
      posY += (targetY - posY) * 0.5;

      if (dot) {
        dot.style.transform = `translate3d(${posX}px, ${posY}px, 0)`;
      }

      rafId = requestAnimationFrame(render);
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!visible) setVisible(true);
      targetX = e.clientX;
      targetY = e.clientY;

      const target = e.target as Element | null;
      const interEl = target?.closest?.(
        "button, a, input, select, textarea, [role='button'], .group, [data-hud-label]"
      );
      setHovered(!!interEl);
    };

    const onPointerDown = () => setPressed(true);
    const onPointerUp = () => setPressed(false);
    const onMouseLeave = () => setVisible(false);
    const onMouseEnter = () => setVisible(true);

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerdown", onPointerDown, { passive: true });
    window.addEventListener("pointerup", onPointerUp, { passive: true });
    document.addEventListener("mouseleave", onMouseLeave);
    document.addEventListener("mouseenter", onMouseEnter);

    rafId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointerup", onPointerUp);
      document.removeEventListener("mouseleave", onMouseLeave);
      document.removeEventListener("mouseenter", onMouseEnter);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [enabled, visible]);

  // No fine pointer (phone/tablet): drop the custom cursor entirely.
  if (!enabled) return null;

  return (
    <div
      ref={dotRef}
      aria-hidden
      style={{ opacity: visible ? 1 : 0 }}
      className="pointer-events-none fixed left-0 top-0 z-[99999] -translate-x-1/2 -translate-y-1/2 transition-opacity duration-150 will-change-transform"
    >
      <div
        className={cn(
          "relative flex items-center justify-center rounded-full transition-all duration-150 ease-out",
          hovered
            ? "h-7 w-7 border border-[#e60026] bg-[#e60026]/20 shadow-[0_0_20px_#e60026]"
            : "h-3 w-3 bg-[#e60026] shadow-[0_0_12px_#e60026]",
          pressed && "scale-75 opacity-80"
        )}
      >
        {/* Pulsing White Core Dot on Hover */}
        {hovered && (
          <span className="h-1.5 w-1.5 rounded-full bg-white shadow-[0_0_8px_#ffffff] animate-pulse" />
        )}
      </div>
    </div>
  );
}
