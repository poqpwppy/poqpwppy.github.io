"use client";

import { AnimatePresence, motion } from "framer-motion";
import { createContext, useContext, useEffect, useState } from "react";

export type IntroStage = "loading" | "title_only" | "full";

const IntroContext = createContext<{ stage: IntroStage }>({
  stage: "full",
});

export function useIntroStage() {
  return useContext(IntroContext);
}

const messages = ["Hello there.", "Welcome to Khoa's website.", "Enjoy."];

export function IntroLoader({ children }: { children: React.ReactNode }) {
  const [stage, setStage] = useState<IntroStage>("loading");
  const [displayed, setDisplayed] = useState("");
  const [messageIndex, setMessageIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  // Intro typewriter animation (typing + deletion backspacing)
  useEffect(() => {
    if (stage !== "loading") return;

    const currentFullText = messages[messageIndex];
    let timer: NodeJS.Timeout;

    if (!isDeleting && displayed.length < currentFullText.length) {
      // Type next character
      const speed = 55 + (Math.random() * 20 - 10);
      timer = setTimeout(() => {
        setDisplayed(currentFullText.slice(0, displayed.length + 1));
      }, speed);
    } else if (!isDeleting && displayed.length === currentFullText.length) {
      // Full phrase typed
      const isLastMessage = messageIndex === messages.length - 1;
      const pauseDuration = isLastMessage ? 1100 : 1000;

      timer = setTimeout(() => {
        if (isLastMessage) {
          // Final phrase -> fade intro overlay smoothly into title_only stage
          setStage("title_only");
        } else {
          // Start deleting backspace effect
          setIsDeleting(true);
        }
      }, pauseDuration);
    } else if (isDeleting && displayed.length > 0) {
      // Backspacing / deletion effect
      const deleteSpeed = 30;
      timer = setTimeout(() => {
        setDisplayed(currentFullText.slice(0, displayed.length - 1));
      }, deleteSpeed);
    } else if (isDeleting && displayed.length === 0) {
      // Finished deleting -> move to next message
      timer = setTimeout(() => {
        setIsDeleting(false);
        setMessageIndex((prev) => prev + 1);
      }, 250);
    }

    return () => clearTimeout(timer);
  }, [displayed, isDeleting, messageIndex, stage]);

  // Transition from title_only -> full stage (slow, elegant reveal)
  useEffect(() => {
    if (stage !== "title_only") return;

    const timer = window.setTimeout(() => {
      setStage("full");
      if (typeof window !== "undefined") sessionStorage.setItem("intro_seen", "1");
    }, 1200);

    return () => window.clearTimeout(timer);
  }, [stage]);

  const handleSkip = () => {
    setStage("full");
    if (typeof window !== "undefined") sessionStorage.setItem("intro_seen", "1");
  };

  return (
    <IntroContext.Provider value={{ stage }}>
      <AnimatePresence>
        {stage === "loading" && (
          <motion.div
            key="intro-loader"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, filter: "blur(4px)" }}
            transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1] }}
            onClick={handleSkip}
            className="fixed inset-0 z-[99] flex cursor-pointer items-center justify-center overflow-hidden bg-black"
          >
            <div className="mx-6 max-w-2xl text-center">
              <motion.h1
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="font-mono text-2xl font-semibold uppercase tracking-[0.2em] text-white sm:text-4xl"
              >
                {displayed}
                <span className="ml-1 inline-block animate-pulse text-white">|</span>
              </motion.h1>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="min-h-screen">{children}</div>
    </IntroContext.Provider>
  );
}
