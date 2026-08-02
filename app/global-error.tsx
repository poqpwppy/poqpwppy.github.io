"use client";

import "./globals.css";

/**
 * Root error boundary. Next.js renders this in place of the whole layout
 * tree when an error escapes every other boundary, so it must own its own
 * <html>/<body>. Gives the user a styled reload screen instead of the raw
 * "Application error" overlay.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="vi">
      <body>
        <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-bg px-6 font-mono text-fg">
          <p className="text-[0.7rem] uppercase tracking-[0.25em] text-fg3">
            [ FATAL ]
          </p>
          <h1 className="font-display text-2xl uppercase tracking-[0.08em] text-accent">
            Unexpected client error
          </h1>
          <p className="max-w-md text-center text-sm leading-relaxed text-fg2">
            {error.message}
          </p>
          <button
            type="button"
            onClick={() => reset()}
            className="cursor-pointer border border-line2 bg-bg2 px-5 py-2 font-mono text-xs uppercase tracking-[0.15em] text-fg transition-colors duration-200 hover:border-accent hover:text-accent"
          >
            ⟳ Reload
          </button>
        </div>
      </body>
    </html>
  );
}
