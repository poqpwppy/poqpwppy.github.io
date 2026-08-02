"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type EmotionMood = "happy" | "sad" | "sleepy" | "excited";

/**
 * Twin Square Cybernetic Robot Eyes:
 * - Pure Square Matrix geometry (Chebyshev distance norm)
 * - Zero white outer border / zero white dots
 * - Silky sub-pixel spring physics with soft crimson aura glow tracking mouse cursor
 * - Real-time Weather & Time-based Emotions (Happy / Sad / Sleepy / Excited)
 * - Natural 3-stage mechanical square eyelid blinking
 */
export function AsciiEye({
  className,
  isHovered = false,
}: {
  className?: string;
  isHovered?: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const preRef = useRef<HTMLPreElement>(null);

  const eyePosRef = useRef({
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    targetX: 0,
    targetY: 0,
  });

  const [blinkState, setBlinkState] = useState<0 | 1 | 2>(0);
  const [mood, setMood] = useState<EmotionMood>("happy");

  const blinkStateRef = useRef<0 | 1 | 2>(0);
  const moodRef = useRef<EmotionMood>("happy");

  useEffect(() => {
    blinkStateRef.current = blinkState;
  }, [blinkState]);

  useEffect(() => {
    if (isHovered) {
      moodRef.current = "excited";
    } else {
      moodRef.current = mood;
    }
  }, [isHovered, mood]);

  // Determine mood from current time & time-of-day weather cycle
  useEffect(() => {
    const updateWeatherMood = () => {
      const hour = new Date().getHours();
      if (hour >= 23 || hour < 6) {
        setMood("sleepy");
      } else if (hour >= 6 && hour < 12) {
        setMood("happy");
      } else if (hour >= 12 && hour < 18) {
        setMood("excited");
      } else {
        setMood("sad");
      }
    };

    updateWeatherMood();
    const interval = setInterval(updateWeatherMood, 60000);
    return () => clearInterval(interval);
  }, []);

  // Track cursor position with smooth window relative coordinates
  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const eyeX = rect.left + rect.width / 2;
      const eyeY = rect.top + rect.height / 2;

      const dx = (e.clientX - eyeX) / (window.innerWidth * 0.45);
      const dy = (e.clientY - eyeY) / (window.innerHeight * 0.45);

      eyePosRef.current.targetX = Math.max(-1, Math.min(1, dx));
      eyePosRef.current.targetY = Math.max(-1, Math.min(1, dy));
    };

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMouseMove);
  }, []);

  // Natural periodic mechanical blinking
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      if (Math.random() > 0.2) {
        setBlinkState(1);
        setTimeout(() => {
          setBlinkState(2);
          setTimeout(() => {
            setBlinkState(1);
            setTimeout(() => setBlinkState(0), 70);
          }, 110);
        }, 50);
      }
    }, 3800);
    return () => clearInterval(blinkInterval);
  }, []);

  // Silky continuous 60fps animation render loop
  const exFactorRef = useRef(0);

  useEffect(() => {
    let rafId: number;
    let time = 0;

    const render = () => {
      time += 0.02;
      const p = eyePosRef.current;

      // Smooth continuous lerp for eye-widening expansion (trố mắt từ từ)
      const targetEx = isHovered ? 1.0 : 0.0;
      exFactorRef.current += (targetEx - exFactorRef.current) * 0.08;
      const ex = exFactorRef.current;

      const springK = 0.10 + ex * 0.08;
      const damping = 0.84 - ex * 0.08;
      const ax = (p.targetX - p.x) * springK;
      const ay = (p.targetY - p.y) * springK;

      p.vx = (p.vx + ax) * damping;
      p.vy = (p.vy + ay) * damping;
      p.x += p.vx;
      p.y += p.vy;

      const idleX = Math.sin(time * 2.2) * 0.03;
      const idleY = Math.cos(time * 2.8) * 0.03;
      const finalX = p.x + idleX;
      const finalY = p.y + idleY;

      if (preRef.current) {
        preRef.current.innerHTML = generateExpressiveSquareRobotEyes(
          finalX,
          finalY,
          blinkStateRef.current,
          moodRef.current,
          ex
        );
      }

      if (containerRef.current) {
        const scale = 1.0 + ex * 0.18;
        containerRef.current.style.transform = `scale(${scale})`;
      }

      rafId = requestAnimationFrame(render);
    };

    rafId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(rafId);
  }, [isHovered]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "pointer-events-none select-none flex flex-col items-center justify-center font-mono bg-transparent border-none p-0 group transition-shadow duration-500",
        className
      )}
    >
      <pre
        ref={preRef}
        className="font-mono text-[0.68rem] sm:text-[0.80rem] md:text-[0.92rem] leading-none tracking-tight text-neutral-200"
        style={{
          textShadow: "0 0 18px rgba(230,0,38,0.95), 0 0 35px rgba(255,255,255,0.5)",
        }}
      />
    </div>
  );
}

function generateExpressiveSquareRobotEyes(
  offsetX: number,
  offsetY: number,
  blinkState: 0 | 1 | 2,
  mood: EmotionMood,
  exFactor: number = 0
): string {
  const numRows = 7;
  const numCols = 21;

  const centerR = 3;
  const leftCenterC = 4;
  const rightCenterC = 16;

  const pupilR = centerR + offsetY * 1.5;
  const leftPupilC = leftCenterC + offsetX * 1.8;
  const rightPupilC = rightCenterC + offsetX * 1.8;

  const lines: string[][] = [];

  const pupilCore = `<span style="color:#ffffff;text-shadow:0 0 20px #ffffff,0 0 40px #e60026;font-weight:900">@</span>`;
  const pupilRed = `<span style="color:#e60026;text-shadow:0 0 16px #e60026;font-weight:bold">*</span>`;
  const irisRing = `<span style="color:#ff2244;text-shadow:0 0 12px #ff2244;font-weight:bold">#</span>`;

  // Closed Blink Line
  if (blinkState === 2) {
    for (let r = 0; r < numRows; r++) {
      if (r === centerR) {
        lines.push([
          ` `.repeat(2),
          `<span style="color:#e60026;text-shadow:0 0 14px #e60026;font-weight:bold">- - - - -</span>`,
          ` `.repeat(7),
          `<span style="color:#e60026;text-shadow:0 0 14px #e60026;font-weight:bold">- - - - -</span>`,
          ` `.repeat(2),
        ]);
      } else {
        lines.push([Array(numCols).fill(" ").join("")]);
      }
    }
    return lines.map((l) => l.join("")).join("\n");
  }

  for (let r = 0; r < numRows; r++) {
    const rowChars: string[] = [];
    for (let c = 0; c < numCols; c++) {
      const dxL = Math.abs(c - leftPupilC) * 0.78;
      const dyL = Math.abs(r - pupilR);
      let squareDistL = Math.max(dxL, dyL);

      const dxR = Math.abs(c - rightPupilC) * 0.78;
      const dyR = Math.abs(r - pupilR);
      let squareDistR = Math.max(dxR, dyR);

      // Smooth expansion modifier for eye widening
      if (exFactor > 0) {
        const expansionScale = 1.0 - exFactor * 0.18;
        squareDistL *= expansionScale;
        squareDistR *= expansionScale;
      }

      // Apply Mood Expression Modifiers
      if (mood === "happy" && exFactor < 0.5) {
        if (r > pupilR + 1) {
          squareDistL += 2.0;
          squareDistR += 2.0;
        }
      } else if (mood === "sad" && exFactor < 0.5) {
        if (r < pupilR - 1) {
          squareDistL += 2.0;
          squareDistR += 2.0;
        }
      } else if (mood === "sleepy" && exFactor < 0.5) {
        if (r < pupilR) {
          squareDistL += 1.6;
          squareDistR += 1.6;
        }
      }

      if (blinkState === 1) {
        if (r < pupilR - 0.5) {
          squareDistL += 2.5;
          squareDistR += 2.5;
        }
      }

      const minDist = Math.min(squareDistL, squareDistR);

      const coreThresh = 0.9 + exFactor * 0.35;
      const redThresh = 1.9 + exFactor * 0.45;
      const ringThresh = 2.9 + exFactor * 0.55;

      if (minDist < coreThresh) {
        rowChars.push(pupilCore);
      } else if (minDist < redThresh) {
        rowChars.push(pupilRed);
      } else if (minDist < ringThresh) {
        rowChars.push(irisRing);
      } else {
        rowChars.push(" ");
      }
    }
    lines.push(rowChars);
  }

  return lines.map((line) => line.join("")).join("\n");
}
