"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence, useScroll, useSpring, useTransform } from "framer-motion";

export function CustomScrollbar() {
  const pathname = usePathname();
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [percentReadout, setPercentReadout] = useState(0);
  const railRef = useRef<HTMLDivElement>(null);

  // Normalize pathname to check if on Homepage (/vi, /en, /)
  const normalizedPath = pathname ? pathname.replace(/^\/(vi|en)/, "") : "";
  const isHomePage = normalizedPath === "" || normalizedPath === "/";

  const { scrollYProgress } = useScroll();

  // Smooth physics spring interpolation for butter-smooth gliding
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 260,
    damping: 28,
    restDelta: 0.0001,
  });

  // Calculate top position cleanly with a function transform
  const thumbTop = useTransform(smoothProgress, (val) => {
    const clamped = Math.max(0, Math.min(1, val));
    return `calc(${clamped * 100}% - ${clamped * 24}px)`;
  });

  useEffect(() => {
    // Forcefully clear any stuck inline overflow styles from hot reloads
    document.body.style.overflow = "";
    
    const unsubscribe = scrollYProgress.on("change", (latest) => {
      setPercentReadout(Math.round(latest * 100));
    });
    return () => unsubscribe();
  }, [scrollYProgress]);

  const scrollToPercent = useCallback((percent: number) => {
    const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (totalHeight <= 0) return;
    const targetY = Math.max(0, Math.min(totalHeight, percent * totalHeight));
    window.scrollTo({ top: targetY, behavior: "auto" });
  }, []);

  const handleRailClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!railRef.current || isDragging) return;
    const rect = railRef.current.getBoundingClientRect();
    const clickY = e.clientY - rect.top;
    const percent = Math.max(0, Math.min(1, clickY / rect.height));
    const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
    window.scrollTo({ top: percent * totalHeight, behavior: "smooth" });
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    // Prevent default touch scrolling so touch drag moves the scrollbar cleanly
    e.preventDefault();
    e.stopPropagation();

    const target = e.currentTarget;
    try {
      target.setPointerCapture(e.pointerId);
    } catch {}
    
    setIsDragging(true);

    const updateScrollFromPointer = (clientY: number) => {
      const rail = railRef.current;
      if (!rail) return;
      const rect = rail.getBoundingClientRect();
      const clickY = clientY - rect.top;
      const percent = Math.max(0, Math.min(1, clickY / rect.height));
      scrollToPercent(percent);
    };

    updateScrollFromPointer(e.clientY);

    const onPointerMove = (moveEvent: PointerEvent) => {
      if (moveEvent.pointerId === e.pointerId) {
        updateScrollFromPointer(moveEvent.clientY);
      }
    };

    const onPointerUp = (upEvent: PointerEvent) => {
      if (upEvent.pointerId === e.pointerId) {
        setIsDragging(false);
        try {
          target.releasePointerCapture(upEvent.pointerId);
        } catch {}
        window.removeEventListener("pointermove", onPointerMove);
        window.removeEventListener("pointerup", onPointerUp);
        window.removeEventListener("pointercancel", onPointerUp);
      }
    };

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointercancel", onPointerUp);
  };

  // Hide scrollbar completely on hero homepage
  if (isHomePage) {
    return null;
  }

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={() => setIsHovered(true)}
      onTouchEnd={() => {
        if (!isDragging) setIsHovered(false);
      }}
      className="fixed right-1 sm:right-4 top-1/2 -translate-y-1/2 z-40 flex items-center select-none pointer-events-auto touch-none"
    >
      {/* Absolute Percentage HUD Tooltip */}
      <AnimatePresence>
        {(isHovered || isDragging) && (
          <motion.div
            initial={{ opacity: 0, x: 6 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 6 }}
            transition={{ duration: 0.15 }}
            className="absolute right-7 sm:right-7 top-1/2 -translate-y-1/2 font-mono text-[10px] font-black text-[#e60026] bg-black/90 border border-[#e60026]/40 px-1.5 py-0.5 rounded-sm tracking-wider shadow-[0_0_10px_rgba(230,0,38,0.3)] pointer-events-none whitespace-nowrap"
          >
            [{percentReadout}%]
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cyber Rail Track with touch hit-box optimization for iPad / Mobile */}
      <div
        ref={railRef}
        onClick={handleRailClick}
        className="relative h-[200px] sm:h-[260px] w-6 sm:w-4 flex justify-center items-center cursor-pointer py-1 group touch-none"
      >
        {/* Track Line */}
        <div className="h-full w-1 sm:w-0.5 bg-neutral-900 border-x border-neutral-800/80 rounded-full group-hover:bg-neutral-800 transition-colors" />

        {/* Glow Red Indicator Thumb — Touch-capturable & grabbable */}
        <motion.div
          onPointerDown={handlePointerDown}
          style={{ top: thumbTop }}
          className="absolute w-4 h-6 sm:w-3 sm:h-5 bg-[#e60026] rounded-[2px] shadow-[0_0_12px_#e60026] border border-white/40 cursor-grab active:cursor-grabbing hover:scale-125 transition-transform duration-75 touch-none"
        />
      </div>
    </div>
  );
}
