"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { profile } from "@/lib/profile";
import { EASE } from "@/lib/animations";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { AsciiEye } from "@/components/ascii/AsciiEye";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/writeups", key: "writeups" },
  { href: "/research", key: "research" },
  { href: "/tools", key: "tools" },
  { href: "/about", key: "about" },
  { href: "/contact", key: "contact" },
] as const;

function Brand() {
  return (
    <Link
      href="/"
      className="group flex items-baseline gap-1.5 font-mono text-sm font-semibold tracking-tight text-fg shrink-0"
      aria-label={profile.handle}
    >
      <span className="text-accent transition-transform duration-200 group-hover:-rotate-6 inline-block">
        ~$
      </span>
      <span>{profile.handle}</span>
      <span aria-hidden className="animate-blink -mb-px inline-block h-3.5 w-[7px] bg-accent" />
    </Link>
  );
}

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const t = useTranslations("nav");
  const pathname = usePathname();

  return (
    <>
      <Link
        href="/"
        onClick={onNavigate}
        className={cn(
          "relative px-1 py-1.5 font-mono text-[0.8rem] uppercase tracking-[0.1em] transition-colors",
          pathname === "/" ? "text-accent" : "text-fg2 hover:text-fg",
        )}
      >
        {t("home")}
      </Link>
      {NAV.map((item) => {
        const active =
          pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "relative px-1 py-1.5 font-mono text-[0.8rem] uppercase tracking-[0.1em] transition-colors",
              active ? "text-accent" : "text-fg2 hover:text-fg",
            )}
          >
            {t(item.key)}
          </Link>
        );
      })}
    </>
  );
}

export function Header() {
  const t = useTranslations("nav");
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const reduce = useReducedMotion();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock body scroll while the mobile menu is open.
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-40 transition-[background,border-color,backdrop-filter] duration-300",
          scrolled
            ? "border-b border-line bg-bg/85 backdrop-blur-md"
            : "border-b border-transparent bg-transparent",
        )}
      >
        <div className="container-page flex h-16 items-center justify-between gap-4 sm:gap-6">
          {/* Brand + Cyber ASCII Eye in Navbar */}
          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            <Brand />
            <div className="h-4 w-[1px] bg-neutral-800 hidden sm:block" />
            <div className="hidden sm:flex items-center justify-center scale-[0.55] sm:scale-[0.65] md:scale-75 origin-left border border-[#e60026]/40 bg-black/90 px-2.5 py-0.5 rounded-full backdrop-blur-xl shadow-[0_0_15px_rgba(230,0,38,0.4)]">
              <AsciiEye />
            </div>
          </div>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-5 lg:flex" aria-label={t("menu")}>
            <NavLinks />
          </nav>

          <div className="flex items-center gap-3">
            {/* Mobile toggle */}
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls="mobile-nav"
              aria-label={open ? t("closeMenu") : t("openMenu")}
              className="flex h-9 w-9 cursor-pointer flex-col items-center justify-center gap-[5px] rounded-sm border border-line bg-bg2 lg:hidden"
            >
              <span
                className={cn(
                  "h-px w-4 bg-fg transition-transform duration-200",
                  open && "translate-y-[3px] rotate-45",
                )}
              />
              <span
                className={cn(
                  "h-px w-4 bg-fg transition-transform duration-200",
                  open && "-translate-y-[3px] -rotate-45",
                )}
              />
            </button>
          </div>
        </div>
      </header>

      {/* Floating Bottom-Center Language Switcher */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 pointer-events-auto flex items-center justify-center">
        <LanguageSwitcher variant="floating-dock" />
      </div>

      {/* Mobile nav overlay */}
      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-nav"
            className="fixed inset-0 z-30 flex flex-col bg-bg/98 backdrop-blur-sm lg:hidden"
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reduce ? undefined : { opacity: 0 }}
            transition={{ duration: 0.25, ease: EASE }}
          >
            <div className="container-page mt-24 flex flex-1 flex-col gap-1 overflow-y-auto pb-10">
              <NavLinks onNavigate={() => setOpen(false)} />
              <p className="mt-auto pt-10 font-mono text-[0.7rem] uppercase tracking-[0.2em] text-fg3">
                {profile.handle} · {profile.titleVi}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
