"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { ArrowDown } from "@/components/icons";
import { useIntroStage } from "@/components/layout/IntroLoader";

/**
 * Three identities the hero cycles through — exact spec text.
 *   "I'm Dang Le Dang Khoa"
 *   "I'm a Pentester / Security Researcher"
 *   "I'm a Video Editor & Designer"
 */
const ROTATING_TITLES = [
  "I'm Dang Le Dang Khoa",
  "I'm a Pentester",
  "I'm a Security Researcher",
  "I'm a Video Editor & Designer",
];

const TITLE_CLASS =
  "font-mono uppercase tracking-tight text-white text-balance leading-[1.05] text-4xl sm:text-6xl md:text-8xl lg:text-9xl";

function TypewriterCursor() {
  return (
    <span className="ml-1 inline-block animate-blink font-bold text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.85)]">
      _
    </span>
  );
}

function RotatingTypewriter({ isStarted }: { isStarted: boolean }) {
  const [titleIdx, setTitleIdx] = useState(0);
  const [subIdx, setSubIdx] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!isStarted) return;

    const currentFullText = ROTATING_TITLES[titleIdx];
    let timer: NodeJS.Timeout;

    if (!isDeleting && subIdx < currentFullText.length) {
      // Smooth typing speed with natural mechanical cadence
      const speed = 50 + (Math.random() * 25 - 12);
      timer = setTimeout(() => setSubIdx((prev) => prev + 1), speed);
    } else if (!isDeleting && subIdx === currentFullText.length) {
      // Pause to let the user read full phrase
      timer = setTimeout(() => setIsDeleting(true), 2000);
    } else if (isDeleting && subIdx > 0) {
      // Fast backspacing
      timer = setTimeout(() => setSubIdx((prev) => prev - 1), 25);
    } else if (isDeleting && subIdx === 0) {
      // Slight pause after deletion before starting next sentence
      timer = setTimeout(() => {
        setIsDeleting(false);
        setTitleIdx((prev) => (prev + 1) % ROTATING_TITLES.length);
      }, 350);
    }

    return () => clearTimeout(timer);
  }, [subIdx, isDeleting, titleIdx, isStarted]);

  const currentText = ROTATING_TITLES[titleIdx].substring(0, subIdx);

  return (
    <span className={TITLE_CLASS}>
      {currentText}
      <TypewriterCursor />
    </span>
  );
}

/**
 * Hero — Pure, Minimal Parallax Scrolling & Staged Reveal.
 * Only the typewriter title and scroll cue with smooth parallax depth.
 */
export function Hero() {
  const containerRef = useRef<HTMLElement>(null);
  const { stage } = useIntroStage();
  const reduce = useReducedMotion();

  const isTitleVisible = stage === "title_only" || stage === "full";
  const isFullVisible = stage === "full";

  // Parallax scroll transforms for main title and scroll cue
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const titleY = useTransform(scrollYProgress, [0, 1], [0, 280]);
  const titleScale = useTransform(scrollYProgress, [0, 0.75], [1, 0.88]);
  const titleOpacity = useTransform(scrollYProgress, [0, 0.65], [1, 0]);
  const arrowY = useTransform(scrollYProgress, [0, 0.5], [0, 120]);

  return (
    <header
      ref={containerRef}
      className="relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden px-6 text-center"
    >
      {/* Centered oversized rotating typewriter with smooth Parallax motion */}
      <motion.div
        style={{
          y: reduce ? 0 : titleY,
          opacity: reduce ? 1 : titleOpacity,
          scale: reduce ? 1 : titleScale,
        }}
        className={`relative z-10 flex w-full flex-1 items-center justify-center px-2 py-24 transition-[filter] duration-1000 ${
          stage === "title_only"
            ? "drop-shadow-[0_0_45px_rgba(255,255,255,0.95)]"
            : "drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]"
        }`}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.97, filter: "blur(6px)" }}
          animate={{
            opacity: isTitleVisible ? 1 : 0,
            scale: isTitleVisible ? 1 : 0.97,
            filter: isTitleVisible ? "blur(0px)" : "blur(6px)",
          }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="w-full text-center"
        >
          <RotatingTypewriter isStarted={isTitleVisible} />
        </motion.div>
      </motion.div>

      {/* Down Scroll Cue with Parallax movement */}
      <motion.a
        href="#columns"
        aria-label="Scroll down"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: isFullVisible ? 1 : 0, y: isFullVisible ? 0 : 10 }}
        style={{ y: reduce ? 0 : arrowY }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-1 font-mono text-[0.6rem] uppercase tracking-[0.25em] text-neutral-500 transition-colors hover:text-white"
      >
        <ArrowDown className="animate-bounce text-base" />
      </motion.a>
    </header>
  );
}