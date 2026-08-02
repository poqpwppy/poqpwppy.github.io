"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence, useScroll, useSpring, useTransform } from "framer-motion";

export function CustomScrollbar() {
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [percentReadout, setPercentReadout] = useState(0);
  const railRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll();

  // Smooth physics spring interpolation for butter-smooth gliding when mouse wheel scrolls
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 260,
    damping: 28,
    restDelta: 0.0001,
  });

  // Calculate top position cleanly with a function transform
  const thumbTop = useTransform(smoothProgress, (val) => {
    const clamped = Math.max(0, Math.min(1, val));
    return `calc(${clamped * 100}% - ${clamped * 20}px)`;
  });

  useEffect(() => {
    // Forcefully clear any stuck inline overflow styles from hot reloads
    document.body.style.overflow = "";
    
    const unsubscribe = scrollYProgress.on("change", (latest) => {
      setPercentReadout(Math.round(latest * 100));
    });
    return () => unsubscribe();
  }, [scrollYProgress]);

  const scrollToPercent = (percent: number) => {
    const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
    const targetY = Math.max(0, Math.min(totalHeight, percent * totalHeight));
    window.scrollTo({ top: targetY, behavior: "smooth" });
  };

  const handleRailClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!railRef.current) return;
    const rect = railRef.current.getBoundingClientRect();
    const clickY = e.clientY - rect.top;
    const percent = Math.max(0, Math.min(1, clickY / rect.height));
    scrollToPercent(percent);
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
    const rail = railRef.current;
    if (!rail) return;

    const onPointerMove = (moveEvent: PointerEvent) => {
      const rect = rail.getBoundingClientRect();
      const clickY = moveEvent.clientY - rect.top;
      const percent = Math.max(0, Math.min(1, clickY / rect.height));
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      window.scrollTo({ top: percent * totalHeight, behavior: "auto" });
    };

    const onPointerUp = () => {
      setIsDragging(false);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    };

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
  };

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="fixed right-2 sm:right-4 top-1/2 -translate-y-1/2 z-40 flex items-center select-none pointer-events-auto"
    >
      {/* Absolute Percentage HUD Tooltip (Floats to the left of the rail without shifting layout) */}
      <AnimatePresence>
        {(isHovered || isDragging) && (
          <motion.div
            initial={{ opacity: 0, x: 6 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 6 }}
            transition={{ duration: 0.15 }}
            className="absolute right-5 top-1/2 -translate-y-1/2 font-mono text-[10px] font-black text-[#e60026] bg-black/90 border border-[#e60026]/40 px-1.5 py-0.5 rounded-sm tracking-wider shadow-[0_0_10px_rgba(230,0,38,0.3)] pointer-events-none whitespace-nowrap"
          >
            [{percentReadout}%]
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cyber Rail Track */}
      <div
        ref={railRef}
        onClick={handleRailClick}
        className="relative h-[180px] sm:h-[260px] w-2 flex justify-center cursor-pointer py-1 group"
      >
        {/* Track Line */}
        <div className="h-full w-0.5 bg-neutral-900 border-x border-neutral-800/80 rounded-full group-hover:bg-neutral-800 transition-colors" />

        {/* Glow Red Indicator Thumb — Smooth physics spring sliding */}
        <motion.div
          onPointerDown={handlePointerDown}
          style={{ top: thumbTop }}
          className="absolute w-2.5 h-5 bg-[#e60026] rounded-[2px] shadow-[0_0_12px_#e60026] border border-white/40 cursor-grab active:cursor-grabbing hover:scale-125 transition-transform duration-75"
        />
      </div>
    </div>
  );
}
