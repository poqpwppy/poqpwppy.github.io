import { cn } from "@/lib/utils";
import { Link } from "@/i18n/navigation";

type BadgeProps = {
  children: React.ReactNode;
  className?: string;
  /** Render as a link (used for tag chips, filter pills). */
  href?: string;
  tone?: "neutral" | "accent" | "mint" | "warn" | "err";
};

const tones = {
  neutral: "bg-bg3 border-line text-fg2",
  accent: "bg-white/10 border-white/40 text-white",
  mint: "bg-white/5 border-neutral-700 text-neutral-300",
  warn: "bg-white/5 border-neutral-600 text-neutral-200",
  err: "bg-white/20 border-white text-white font-semibold",
} as const;

/** Small mono chip used for tags, statuses and metadata. */
export function Badge({ children, className, href, tone = "neutral" }: BadgeProps) {
  const classes = cn("chip", tones[tone], className);
  if (href) {
    return (
      <Link href={href} className={cn(classes, "transition-colors hover:border-accent/60 hover:text-fg")}>
        {children}
      </Link>
    );
  }
  return <span className={classes}>{children}</span>;
}
