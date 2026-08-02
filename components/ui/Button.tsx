import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "ghost" | "outline";

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-white text-black hover:bg-neutral-200 border border-white font-bold transition-all shadow-[0_0_20px_rgba(255,255,255,0.15)]",
  outline:
    "bg-transparent text-white border border-neutral-700 hover:border-white hover:bg-white/5",
  ghost: "bg-transparent text-neutral-400 border border-transparent hover:text-white",
};

const sizes = {
  sm: "px-3.5 py-2 text-xs",
  md: "px-5 py-2.5 text-sm",
} as const;

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: keyof typeof sizes;
};

/** Editorial button — squared, mono uppercase, no pill corners. */
export function Button({
  variant = "primary",
  size = "md",
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex cursor-pointer select-none items-center justify-center gap-2 rounded-none font-mono font-semibold uppercase tracking-[0.1em] transition-[background,border-color,color,box-shadow] duration-250 ease-out",
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    />
  );
}

type ButtonLinkProps = React.ComponentProps<"a"> & {
  variant?: ButtonVariant;
  size?: keyof typeof sizes;
};

/** `Button` as an anchor (href stays in the caller's locale-aware Link). */
export function buttonLinkClasses({
  variant = "primary",
  size = "md",
  className,
}: Pick<ButtonLinkProps, "variant" | "size" | "className">) {
  return cn(
    "inline-flex items-center justify-center gap-2 rounded-none font-mono font-semibold uppercase tracking-[0.1em] transition-[background,border-color,color,box-shadow] duration-250 ease-out",
    variants[variant],
    sizes[size],
    className,
  );
}
