import Link from "next/link";
import { fontSans, fontPixel } from "@/lib/fonts";
import "../app/globals.css";

/**
 * Global 404 — rendered when the path doesn't match any locale.
 * Self-contained (no next-intl context), so copy is hardcoded bilingual.
 */
export default function GlobalNotFound() {
  return (
    <html lang="vi" className={`${fontSans.variable} ${fontPixel.variable}`}>
      <body className="bg-bg text-fg flex min-h-screen items-center justify-center px-6">
        <div className="text-center">
          <p
            className="font-mono text-[0.75rem] uppercase tracking-[0.3em] text-accent"
            aria-hidden
          >
            HTTP/1.1
          </p>
          <h1 className="font-display mt-3 text-[clamp(4rem,14vw,9rem)] font-extrabold leading-none tracking-tight">
            404
          </h1>
          <p className="mt-4 text-fg2">
            Không tìm thấy trang / Page not found
          </p>
          <Link
            href="/"
            className="mt-8 inline-block border border-line2 bg-bg2 px-5 py-2.5 font-mono text-xs uppercase tracking-[0.12em] text-fg2 transition-colors hover:border-accent hover:text-accent"
          >
            ← Trang chủ / Home
          </Link>
        </div>
      </body>
    </html>
  );
}
