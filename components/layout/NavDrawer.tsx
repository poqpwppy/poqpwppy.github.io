"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { AsciiEye } from "@/components/ascii/AsciiEye";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/", key: "home", index: "00" },
  { href: "/writeups", key: "writeups", index: "01" },
  { href: "/research", key: "research", index: "02" },
  { href: "/tools", key: "tools", index: "03" },
  { href: "/about", key: "about", index: "04" },
  { href: "/contact", key: "contact", index: "05" },
] as const;

export function NavDrawer({
  open,
  onClose,
  drawerId = "nav-drawer",
}: {
  open: boolean;
  onClose: () => void;
  drawerId?: string;
}) {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const [isOptionHovered, setIsOptionHovered] = useState(false);

  useEffect(() => {
    // Intentionally left blank to avoid layout shifts (flicker) from overflow manipulation
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="nav-sao-wheel-modal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          onClick={onClose}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md select-none cursor-pointer style-preserve-3d"
          style={{ WebkitBackfaceVisibility: "hidden", backfaceVisibility: "hidden", willChange: "opacity" }}
        >
          {/* SAO Radial Circular Game HUD Menu Wheel Container */}
          <div
            id={drawerId}
            role="dialog"
            aria-modal="true"
            aria-label={t("menu")}
            onClick={onClose}
            className="relative z-10 flex h-full w-full flex-col items-center justify-center p-6 sm:p-10 cursor-pointer"
          >
            <div
              className="relative flex flex-1 items-center justify-center py-6 overflow-hidden w-full cursor-pointer"
              onClick={onClose}
              style={{ "--hud-radius": "clamp(135px, 24vw, 215px)" } as React.CSSProperties}
            >
              {/* Compact Round Cyber ASCII Eye in Center */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                onClick={(e) => e.stopPropagation()}
                className="relative z-30 flex items-center justify-center pointer-events-none bg-transparent p-0 border-none shadow-none"
              >
                <AsciiEye isHovered={isOptionHovered} />
              </motion.div>

              {/* Spinning Perimeter Radial Wheel Container (36s rotation) */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 36, ease: "linear" }}
                className="absolute flex h-[270px] w-[270px] items-center justify-center sm:h-[430px] sm:w-[430px]"
              >
                {NAV.map((item, i) => {
                  const active =
                    pathname === item.href ||
                    (item.href !== "/" && pathname.startsWith(item.href));

                  // Calculate radial angles around the circle
                  const total = NAV.length;
                  const angleRad = (i / total) * 2 * Math.PI - Math.PI / 2;

                  return (
                    <motion.div
                      key={item.href}
                      initial={{
                        x: `calc(cos(${angleRad}rad) * var(--hud-radius))`,
                        y: `calc(sin(${angleRad}rad) * var(--hud-radius))`,
                        scale: 0.85,
                        opacity: 0,
                      }}
                      animate={{
                        x: `calc(cos(${angleRad}rad) * var(--hud-radius))`,
                        y: `calc(sin(${angleRad}rad) * var(--hud-radius))`,
                        scale: 1,
                        opacity: 1,
                      }}
                      transition={{
                        delay: 0.02 + i * 0.03,
                        duration: 0.45,
                        ease: [0.16, 1, 0.3, 1],
                      }}
                      className="absolute z-20"
                    >
                      {/* Counter-rotate wrapper so text stays right-side up */}
                      <motion.div
                        animate={{ rotate: -360 }}
                        transition={{ repeat: Infinity, duration: 36, ease: "linear" }}
                      >
                        <motion.div
                          whileHover={{ scale: 1.12 }}
                          transition={{ type: "spring", stiffness: 240, damping: 18 }}
                          onClick={(e) => e.stopPropagation()}
                          className="relative cursor-pointer"
                        >
                          <Link
                            href={item.href}
                            onClick={onClose}
                            onMouseEnter={() => setIsOptionHovered(true)}
                            onMouseLeave={() => setIsOptionHovered(false)}
                            data-hud-label={item.index}
                            className={cn(
                              "group relative flex items-center gap-2 px-3 py-1.5 font-mono text-xs font-black uppercase tracking-widest transition-colors duration-300 sm:px-4 sm:py-2 sm:text-sm md:text-base",
                              active
                                ? "text-white"
                                : "text-neutral-300 hover:text-white"
                            )}
                          >
                            {/* HUD Top-Left Corner Bracket */}
                            <span
                              aria-hidden
                              className={cn(
                                "absolute left-0 top-0 h-2 w-2 border-l-2 border-t-2 transition-all duration-300",
                                active
                                  ? "border-[#e60026] shadow-[0_0_8px_#e60026]"
                                  : "border-transparent group-hover:border-[#e60026] group-hover:shadow-[0_0_8px_#e60026]"
                              )}
                            />

                            {/* HUD Bottom-Right Corner Bracket */}
                            <span
                              aria-hidden
                              className={cn(
                                "absolute bottom-0 right-0 h-2 w-2 border-b-2 border-r-2 transition-all duration-300",
                                active
                                  ? "border-[#e60026] shadow-[0_0_8px_#e60026]"
                                  : "border-transparent group-hover:border-[#e60026] group-hover:shadow-[0_0_8px_#e60026]"
                              )}
                            />

                            {/* Index badge */}
                            <span
                              className={cn(
                                "font-mono text-xs font-extrabold tracking-wider transition-colors duration-300 sm:text-sm",
                                active
                                  ? "text-[#e60026]"
                                  : "text-neutral-500 group-hover:text-[#e60026]"
                              )}
                            >
                              [{item.index}]
                            </span>

                            {/* Title */}
                            <span className="whitespace-nowrap transition-colors duration-300">
                              {t(item.key)}
                            </span>
                          </Link>
                        </motion.div>
                      </motion.div>
                    </motion.div>
                  );
                })}
              </motion.div>
            </div>

            {/* Bottom-Center Minimalist Language Switcher */}
            <div
              onClick={(e) => e.stopPropagation()}
              className="absolute bottom-6 sm:bottom-10 left-1/2 -translate-x-1/2 z-40 pointer-events-auto"
            >
              <LanguageSwitcher variant="floating-dock" />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
