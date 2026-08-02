import { cn } from "@/lib/utils";

/** Mono uppercase editorial label, usually paired with a leading dash. */
export function Eyebrow({
  children,
  className,
  index,
}: {
  children: React.ReactNode;
  className?: string;
  /** Optional section index prefix (e.g. "01"). */
  index?: string;
}) {
  return (
    <p className={cn("flex items-center gap-2 font-mono text-xs font-black uppercase tracking-widest text-[#e60026]", className)}>
      {index ? (
        <span aria-hidden className="text-[#e60026]">
          [{index}]
        </span>
      ) : null}
      
      <span className="text-white">{children}</span>
    </p>
  );
}
