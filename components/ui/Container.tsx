import { cn } from "@/lib/utils";

type ContainerProps = React.ComponentProps<"div"> & {
  /** `page` = max 78rem · `narrow` = max 46rem (article body) */
  variant?: "page" | "narrow";
};

/** Max-width wrapper that keeps horizontal rhythm on every page. */
export function Container({
  variant = "page",
  className,
  ...props
}: ContainerProps) {
  return (
    <div
      className={cn(
        variant === "page" ? "container-page" : "container-narrow",
        className,
      )}
      {...props}
    />
  );
}
