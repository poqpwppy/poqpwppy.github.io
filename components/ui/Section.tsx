import { cn } from "@/lib/utils";
import { Container } from "./Container";
import { AnimatedSection } from "./AnimatedSection";
import { Eyebrow } from "./Eyebrow";

type SectionProps = {
  children: React.ReactNode;
  className?: string;
  id?: string;
  /** Space above/below the section. */
  size?: "md" | "lg" | "xl";
  /** Full-bleed grid overlay behind the section (editorial). */
  grid?: boolean;
};

const sizes = {
  md: "py-16 md:py-20",
  lg: "py-20 md:py-28",
  xl: "py-28 md:py-36",
} as const;

/**
 * Semantic page section with consistent vertical rhythm. Optionally
 * reveals on scroll (via AnimatedSection) and can show a faint 12-col
 * grid rule behind content.
 */
export function Section({
  children,
  className,
  id,
  size = "lg",
  grid = false,
}: SectionProps) {
  return (
    <AnimatedSection
      as="section"
      id={id}
      className={cn("relative", sizes[size], className)}
    >
      {grid ? (
        <div
          aria-hidden
          className="grid-overlay pointer-events-none absolute inset-0 hidden opacity-30 lg:block"
        />
      ) : null}
      <Container className="relative">{children}</Container>
    </AnimatedSection>
  );
}

type SectionHeaderProps = {
  eyebrow?: string;
  index?: string;
  title: string;
  subtitle?: string;
  align?: "left" | "center";
  action?: React.ReactNode;
  className?: string;
};

/** Eyebrow + headline + optional action, used at the top of sections. */
export function SectionHeader({
  eyebrow,
  index,
  title,
  subtitle,
  align = "left",
  action,
  className,
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        "mb-10 flex flex-wrap items-end justify-between gap-6 md:mb-14",
        align === "center" && "flex-col items-center text-center",
        className,
      )}
    >
      <div className={cn("max-w-2xl", align === "center" && "mx-auto")}>
        {eyebrow ? <Eyebrow index={index}>{eyebrow}</Eyebrow> : null}
        <h2 className="font-display mt-4 text-balance text-3xl font-extrabold tracking-tight text-fg md:text-4xl">
          {title}
        </h2>
        {subtitle ? <p className="mt-3 text-pretty text-fg2">{subtitle}</p> : null}
      </div>
      {action}
    </div>
  );
}
