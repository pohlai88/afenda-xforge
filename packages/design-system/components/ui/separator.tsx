import type { ComponentProps, ReactElement } from "react";

import { cn } from "#lib/utils";

type SeparatorProps = ComponentProps<"div"> & {
  decorative?: boolean;
  orientation?: "horizontal" | "vertical";
};

function Separator({
  className,
  decorative = true,
  orientation = "horizontal",
  ...props
}: SeparatorProps): ReactElement {
  return (
    <div
      aria-hidden={decorative ? true : undefined}
      className={cn(
        "shrink-0 bg-border",
        orientation === "horizontal" ? "h-px w-full" : "h-full w-px",
        className
      )}
      data-orientation={orientation}
      data-slot="separator"
      role={decorative ? undefined : "separator"}
      {...props}
    />
  );
}

export { Separator };
