import type { ComponentProps, ReactElement } from "react";

import { cn } from "#lib/utils";

function Skeleton({
  className,
  ...props
}: ComponentProps<"div">): ReactElement {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-md bg-muted",
        "before:absolute before:inset-0 before:animate-shimmer before:bg-[length:200%_100%] before:bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.55),transparent)] dark:before:bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.08),transparent)]",
        className
      )}
      data-slot="skeleton"
      {...props}
    />
  );
}

export { Skeleton };
