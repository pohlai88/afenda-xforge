import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";
import { Slot } from "radix-ui";
import type * as React from "react";

import { cn } from "../../lib/utils";

const badgeVariants = cva(
  "inline-flex w-fit shrink-0 items-center justify-center gap-1 overflow-hidden border border-transparent px-2 py-0.5 text-xs font-medium whitespace-nowrap transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&>svg]:pointer-events-none [&>svg]:size-3",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground [a&]:hover:bg-primary/90",
        secondary:
          "bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90",
        destructive:
          "bg-destructive text-white focus-visible:ring-destructive/20 dark:bg-destructive/60 dark:focus-visible:ring-destructive/40 [a&]:hover:bg-destructive/90",
        info: "bg-info text-info-foreground [a&]:hover:bg-info/90",
        success: "bg-success text-success-foreground [a&]:hover:bg-success/90",
        warning: "bg-warning text-warning-foreground [a&]:hover:bg-warning/90",
        invert: "bg-invert text-invert-foreground [a&]:hover:bg-invert/90",
        neutral:
          "bg-muted text-muted-foreground [a&]:hover:bg-muted/80 dark:text-foreground",
        outline:
          "border-border bg-background text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground dark:bg-input/30",
        // Surface badges (*-outline, *-light): use *-muted-foreground for text.
        // *-foreground tokens are contrast pairs for filled badges (text on saturated bg).
        "primary-outline":
          "border-border bg-background text-primary [a&]:hover:bg-accent/50",
        "destructive-outline":
          "border-border bg-background text-destructive-muted-foreground [a&]:hover:bg-accent/50 dark:bg-input/30",
        "info-outline":
          "border-border bg-background text-info-muted-foreground [a&]:hover:bg-accent/50 dark:bg-input/30",
        "success-outline":
          "border-border bg-background text-success-muted-foreground [a&]:hover:bg-accent/50 dark:bg-input/30",
        "warning-outline":
          "border-border bg-background text-warning-muted-foreground [a&]:hover:bg-accent/50 dark:bg-input/30",
        "invert-outline":
          "border-border bg-background text-invert-foreground [a&]:hover:bg-accent/50 dark:bg-input/30",
        "primary-light":
          "border-transparent bg-primary/10 text-primary [a&]:hover:bg-primary/15 dark:bg-primary/20",
        "destructive-light":
          "border-transparent bg-destructive/10 text-destructive-muted-foreground [a&]:hover:bg-destructive/15 dark:bg-destructive/20",
        "info-light":
          "border-transparent bg-info/10 text-info-muted-foreground [a&]:hover:bg-info/15 dark:bg-info/20",
        "success-light":
          "border-transparent bg-success/10 text-success-muted-foreground [a&]:hover:bg-success/15 dark:bg-success/20",
        "warning-light":
          "border-transparent bg-warning/10 text-warning-muted-foreground [a&]:hover:bg-warning/15 dark:bg-warning/20",
        "invert-light":
          "border-transparent bg-invert/10 text-invert [a&]:hover:bg-invert/15 dark:bg-invert/20 dark:text-invert-foreground",
        ghost: "[a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
        link: "text-primary underline-offset-4 [a&]:hover:underline",
      },
      size: {
        xs: "h-4 min-w-4 gap-0.5 px-1 text-[0.625rem] leading-none",
        sm: "h-[1.125rem] min-w-[1.125rem] gap-0.5 px-1.5 text-[0.65rem] leading-none",
        default: "h-5 min-w-5 gap-1 px-2 text-xs leading-none",
        lg: "h-[1.375rem] min-w-[1.375rem] gap-1 px-2.5 text-xs leading-none",
        xl: "h-6 min-w-6 gap-1.5 px-3 text-sm leading-none",
      },
      radius: {
        default: "rounded-full",
        full: "rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      radius: "default",
    },
  },
);

function Badge({
  className,
  variant,
  size,
  radius,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "span";

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      data-size={size}
      className={cn(badgeVariants({ variant, size, radius }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
