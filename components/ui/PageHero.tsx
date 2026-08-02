import { cn } from "@/lib/utils";
import { Container } from "./Container";
import { Eyebrow } from "./Eyebrow";
import { AnimatedSection } from "./AnimatedSection";

type PageHeroProps = {
  index?: string;
  eyebrow: string;
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  className?: string;
};

/** Editorial page hero — eyebrow, display headline, optional actions. */
export function PageHero({
  index,
  eyebrow,
  title,
  subtitle,
  actions,
  className,
}: PageHeroProps) {
  return (
    <AnimatedSection
      as="header"
      className={cn("pt-28 pb-10 md:pt-36 md:pb-14", className)}
    >
      <Container>
        <div className="relative overflow-hidden flex flex-col gap-6 border border-[#e60026]/50 bg-[#160306]/90 p-6 sm:p-10 backdrop-blur-xl lg:flex-row lg:items-end lg:justify-between shadow-[0_0_30px_rgba(230,0,38,0.25)]">
          {/* Holographic HUD Laser Scanline Beam */}
          <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-[#e60026] to-transparent opacity-80 shadow-[0_0_12px_#e60026] animate-hud-scanline" />
          </div>
          {/* HUD Top-Left Corner Bracket */}
          <span
            aria-hidden
            className="absolute left-0 top-0 h-3 w-3 border-l-2 border-t-2 border-[#e60026] shadow-[0_0_10px_#e60026]"
          />

          {/* HUD Bottom-Right Corner Bracket */}
          <span
            aria-hidden
            className="absolute bottom-0 right-0 h-3 w-3 border-b-2 border-r-2 border-[#e60026] shadow-[0_0_10px_#e60026]"
          />

          <div className="max-w-3xl">
            <Eyebrow index={index}>{eyebrow}</Eyebrow>
            <h1 className="font-mono mt-4 text-balance text-3xl font-black uppercase tracking-tight text-white sm:text-4xl md:text-5xl md:leading-tight">
              {title}
            </h1>
            {subtitle ? (
              <p className="mt-4 max-w-2xl font-mono text-sm leading-relaxed text-neutral-400 md:text-base">
                {subtitle}
              </p>
            ) : null}
          </div>
          {index ? (
            <span
              aria-hidden
              className="pointer-events-none absolute right-6 top-6 select-none font-mono text-5xl font-black text-neutral-800/60 sm:text-7xl md:text-8xl"
            >
              [{index}]
            </span>
          ) : null}
          {actions ? (
            <div className="flex shrink-0 flex-wrap items-center gap-3">
              {actions}
            </div>
          ) : null}
        </div>
      </Container>
    </AnimatedSection>
  );
}
