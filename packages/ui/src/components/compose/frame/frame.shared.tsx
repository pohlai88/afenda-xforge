"use client";

import type * as React from "react";

import { cn } from "../../../lib/utils";

type FrameVariant = "default" | "ghost";
type FrameSpacing = "sm" | "default" | "lg";

function spacingClasses(spacing: FrameSpacing) {
  switch (spacing) {
    case "sm":
      return "gap-2 p-2";
    case "lg":
      return "gap-6 p-6";
    default:
      return "gap-4 p-4";
  }
}

function Frame({
  className,
  variant = "default",
  spacing = "default",
  stacked = false,
  dense = false,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  variant?: FrameVariant;
  spacing?: FrameSpacing;
  stacked?: boolean;
  dense?: boolean;
}) {
  return (
    <div
      data-slot="frame"
      data-variant={variant}
      data-spacing={spacing}
      data-stacked={stacked}
      data-dense={dense}
      className={cn(
        "group/frame overflow-hidden rounded-[var(--frame-radius)] border bg-background text-foreground shadow-sm",
        variant === "ghost" && "border-dashed bg-transparent shadow-none",
        dense && "rounded-[var(--frame-radius)] border",
        stacked ? "flex flex-col gap-0" : spacingClasses(spacing),
        className,
      )}
      style={{ "--frame-radius": "var(--radius-xl)" } as React.CSSProperties}
      {...props}
    >
      {children}
    </div>
  );
}

function FramePanel({
  className,
  children,
  ...props
}: React.ComponentProps<"section">) {
  return (
    <section
      data-slot="frame-panel"
      className={cn(
        "rounded-[calc(var(--frame-radius)-2px)] border bg-card text-card-foreground shadow-sm group-data-[dense=true]/frame:p-0 group-data-[stacked=true]/frame:rounded-none group-data-[stacked=true]/frame:border-x-0",
        className,
      )}
      {...props}
    >
      {children}
    </section>
  );
}

function FrameHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="frame-header"
      className={cn(
        "flex flex-col gap-1 border-b px-5 py-4 group-data-[dense=true]/frame:px-4 group-data-[dense=true]/frame:py-3",
        className,
      )}
      {...props}
    />
  );
}

function FrameTitle({ className, ...props }: React.ComponentProps<"h3">) {
  return (
    <h3
      data-slot="frame-title"
      className={cn("text-base leading-none font-semibold", className)}
      {...props}
    />
  );
}

function FrameDescription({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="frame-description"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  );
}

function FrameFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="frame-footer"
      className={cn(
        "flex items-center justify-between gap-3 border-t px-5 py-4 group-data-[dense=true]/frame:px-4 group-data-[dense=true]/frame:py-3",
        className,
      )}
      {...props}
    />
  );
}

export {
  Frame,
  FrameDescription,
  FrameFooter,
  FrameHeader,
  FramePanel,
  FrameTitle,
};
