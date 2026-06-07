import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";
import type { ComponentProps, ReactElement } from "react";

import { cn } from "#lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-1 font-medium text-[11px] tracking-[0.02em] transition-colors",
  {
    variants: {
      variant: {
        neutral: "border-border bg-muted text-muted-foreground",
        primary: "border-transparent bg-primary text-primary-foreground",
        secondary: "border-transparent bg-secondary text-secondary-foreground",
        outline: "border-border bg-background text-foreground",
        info: "border-info-border bg-info-muted text-info-muted-foreground",
        success:
          "border-success-border bg-success-muted text-success-muted-foreground",
        warning:
          "border-warning-border bg-warning-muted text-warning-muted-foreground",
        destructive:
          "border-destructive-border bg-destructive-muted text-destructive-muted-foreground",
      },
    },
    defaultVariants: {
      variant: "neutral",
    },
  }
);

function Badge({
  className,
  variant = "neutral",
  ...props
}: ComponentProps<"span"> & VariantProps<typeof badgeVariants>): ReactElement {
  return (
    <span
      className={cn(badgeVariants({ variant, className }))}
      data-slot="badge"
      {...props}
    />
  );
}

export { Badge, badgeVariants };
