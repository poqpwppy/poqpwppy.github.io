"use client";

import { useIntroStage } from "./IntroLoader";

/**
 * Keyboard-only "Skip to content" link (WCAG 2.4.1 bypass blocks).
 * Hidden off-screen until focused; only rendered after the intro overlay
 * finishes so it never floats on top of the opaque loader screen.
 */
export function SkipLink({ label }: { label: string }) {
  const { stage } = useIntroStage();

  // During the intro the full-screen black overlay is showing; a focused
  // skip link would appear to float in front of it. Render nothing until
  // the intro has fully completed.
  if (stage !== "full") return null;

  return (
    <a href="#main" className="skip-link">
      {label}
    </a>
  );
}
