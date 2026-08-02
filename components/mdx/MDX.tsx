"use client";

import { MDXContent } from "@content-collections/mdx/react";
import { cn } from "@/lib/utils";

/**
 * Renders a compiled MDX component string (the `html` field produced by
 * the content-collections transform). Must be a client component —
 * `MDXContent` evaluates the module via `new Function` with React in
 * scope, which runs on the server (SSR) and on the client alike.
 */
export function MDX({
  code,
  className,
}: {
  code: string;
  className?: string;
}) {
  return (
    <div className={cn("prose-article", className)}>
      <MDXContent code={code} />
    </div>
  );
}
