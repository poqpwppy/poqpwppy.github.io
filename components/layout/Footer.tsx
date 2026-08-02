"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { profile } from "@/lib/profile";

const NAV_LINKS = [
  { href: "/", key: "home" },
  { href: "/writeups", key: "writeups" },
  { href: "/research", key: "research" },
  { href: "/tools", key: "tools" },
  { href: "/about", key: "about" },
  { href: "/contact", key: "contact" },
] as const;

export function Footer() {
  const t = useTranslations("footer");
  const tnav = useTranslations("nav");
  const year = new Date().getFullYear();

  return (
    <footer className="relative z-20 mt-12 w-full border-t border-[#e60026]/30 bg-[#060609]/60 backdrop-blur-xl shadow-[0_-5px_30px_rgba(230,0,38,0.08)]">
      {/* Laser HUD Brackets at top corners */}
      <span aria-hidden className="absolute left-0 top-0 h-3 w-3 border-l-2 border-t-2 border-[#e60026] shadow-[0_0_8px_#e60026]" />
      <span aria-hidden className="absolute right-0 top-0 h-3 w-3 border-r-2 border-t-2 border-[#e60026] shadow-[0_0_8px_#e60026]" />

      <div className="mx-auto w-full max-w-[90rem] px-6 sm:px-10 lg:px-14 py-4 sm:py-5">
        <div className="flex flex-col items-center justify-between gap-5 font-mono md:flex-row text-xs">
          
          {/* Left Block: Brand & Copyright Status */}
          <div className="flex items-center gap-3.5">
            <span className="font-bold text-white uppercase tracking-wider">
              {profile.handle}
            </span>
            <span className="text-neutral-700">|</span>
            <span className="text-neutral-400 font-medium">
              © {year} — <span className="text-neutral-300">All rights reserved</span>
            </span>
          </div>

          {/* Center Block: Single-Row Horizontal Inline Navigation */}
          <nav aria-label={t("navTitle")} className="flex items-center flex-wrap justify-center gap-x-5 gap-y-2">
            {NAV_LINKS.map((item, index) => (
              <span key={item.href} className="flex items-center gap-5">
                <Link
                  href={item.href}
                  className="font-bold uppercase tracking-widest text-neutral-300 transition-all duration-200 hover:text-white hover:drop-shadow-[0_0_8px_rgba(255,42,75,0.85)]"
                >
                  {tnav(item.key as "home")}
                </Link>
                {index < NAV_LINKS.length - 1 && (
                  <span className="text-neutral-700 text-[0.65rem]">▪</span>
                )}
              </span>
            ))}
          </nav>

          {/* Right Block: Clean Social Links */}
          <div className="flex items-center gap-5">
            <ul className="flex items-center gap-4">
              {profile.socials.slice(0, 3).map((s) => (
                <li key={s.label}>
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-bold uppercase tracking-wider text-neutral-400 transition-colors hover:text-[#ff2a4b]"
                  >
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

        </div>
      </div>
    </footer>
  );
}

