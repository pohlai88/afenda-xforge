import type { ComponentProps, ReactElement } from "react";

import { cn } from "#lib/utils";

function Card({
  className,
  ...props
}: ComponentProps<"section">): ReactElement {
  return (
    <section
      className={cn(
        "rounded-xl border border-border bg-card text-card-foreground shadow-sm",
        className
      )}
      data-slot="card"
      {...props}
    />
  );
}

function CardHeader({
  className,
  ...props
}: ComponentProps<"div">): ReactElement {
  return (
    <div
      className={cn("flex flex-col gap-4 px-6 py-5", className)}
      data-slot="card-header"
      {...props}
    />
  );
}

function CardTitle({
  className,
  ...props
}: ComponentProps<"h3">): ReactElement {
  return (
    <h3
      className={cn("font-semibold text-lg tracking-tight", className)}
      data-slot="card-title"
      {...props}
    />
  );
}

function CardDescription({
  className,
  ...props
}: ComponentProps<"p">): ReactElement {
  return (
    <p
      className={cn("text-muted-foreground text-sm leading-6", className)}
      data-slot="card-description"
      {...props}
    />
  );
}

function CardContent({
  className,
  ...props
}: ComponentProps<"div">): ReactElement {
  return (
    <div
      className={cn("px-6 pb-6", className)}
      data-slot="card-content"
      {...props}
    />
  );
}

function CardFooter({
  className,
  ...props
}: ComponentProps<"div">): ReactElement {
  return (
    <div
      className={cn("flex items-center gap-3 px-6 pb-6", className)}
      data-slot="card-footer"
      {...props}
    />
  );
}

export {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
};
