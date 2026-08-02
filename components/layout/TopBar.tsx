"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { profile } from "@/lib/profile";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { NavDrawer } from "./NavDrawer";
import { cn } from "@/lib/utils";

/**
 * Mobile top bar (`lg:hidden`). Brand left, locale switch + hamburger
 * right; the hamburger opens the shared NavDrawer (full-screen on
 * mobile). Desktop navigation lives behind the MenuButton.
 */
export function TopBar() {
  const t = useTranslations("nav");
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-40 border-b transition-[background-color,border-color] duration-300 lg:hidden",
          scrolled ? "border-line bg-bg/85 backdrop-blur-md" : "border-transparent bg-transparent",
        )}
      >
        <div className="flex h-16 items-center justify-between gap-4 px-5">
          <Link
            href="/"
            aria-label={profile.handle}
            data-hud-label={profile.handle}
            className="group inline-flex items-center gap-1.5 font-mono text-sm font-semibold tracking-tight text-fg"
          >
            <span className="text-accent" aria-hidden>
              ❯
            </span>
            {profile.handle}
            <span
              aria-hidden
              className="animate-blink -mb-px inline-block h-3.5 w-[7px] bg-accent"
            />
          </Link>

          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls="mobile-nav"
              aria-label={open ? t("closeMenu") : t("openMenu")}
              className="flex h-9 w-9 cursor-pointer flex-col items-center justify-center gap-[5px] border border-line bg-bg2"
            >
              <span
                className={cn(
                  "h-px w-4 bg-fg transition-transform duration-300",
                  open && "translate-y-[3px] rotate-45",
                )}
              />
              <span
                className={cn(
                  "h-px w-4 bg-fg transition-transform duration-300",
                  open && "-translate-y-[3px] -rotate-45",
                )}
              />
            </button>
          </div>
        </div>
      </header>

      <NavDrawer open={open} onClose={() => setOpen(false)} drawerId="mobile-nav" />
    </>
  );
}
