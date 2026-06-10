"use client";

import { NumberField as NumberFieldPrimitive } from "@base-ui/react/number-field";
import { Minus, MoveHorizontal, Plus, RotateCcw } from "lucide-react";
import * as React from "react";

import { cn } from "../../../lib/utils";
import { Button } from "../../ui-shadcn/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../ui-shadcn/card";
import { Input } from "../../ui-shadcn/input";

const NumberFieldLabelIdContext = React.createContext<string | undefined>(
  undefined,
);

function NumberField({
  className,
  children,
  ...props
}: React.ComponentProps<typeof NumberFieldPrimitive.Root>) {
  const labelId = React.useId();

  return (
    <NumberFieldLabelIdContext.Provider value={labelId}>
      <NumberFieldPrimitive.Root
        data-slot="number-field"
        className={cn("grid gap-2", className)}
        {...props}
      >
        {children}
      </NumberFieldPrimitive.Root>
    </NumberFieldLabelIdContext.Provider>
  );
}

function NumberFieldGroup({
  className,
  ...props
}: React.ComponentProps<typeof NumberFieldPrimitive.Group>) {
  return (
    <NumberFieldPrimitive.Group
      data-slot="number-field-group"
      className={cn(
        "inline-flex items-stretch overflow-hidden rounded-md border bg-background shadow-xs",
        className,
      )}
      {...props}
    />
  );
}

function NumberFieldInput({
  className,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
  ...props
}: React.ComponentProps<typeof NumberFieldPrimitive.Input>) {
  const labelId = React.useContext(NumberFieldLabelIdContext);

  return (
    <NumberFieldPrimitive.Input
      data-slot="number-field-input"
      aria-label={labelId ? undefined : ariaLabel}
      aria-labelledby={ariaLabelledBy ?? labelId}
      render={<Input className="rounded-none border-0 shadow-none" />}
      className={cn(
        "min-w-20 border-0 bg-transparent text-center tabular-nums shadow-none focus-visible:ring-0",
        className,
      )}
      {...props}
    />
  );
}

function NumberFieldDecrement({
  className,
  "aria-label": ariaLabel = "Decrease value",
  ...props
}: React.ComponentProps<typeof NumberFieldPrimitive.Decrement>) {
  return (
    <NumberFieldPrimitive.Decrement
      data-slot="number-field-decrement"
      aria-label={ariaLabel}
      render={
        <Button
          variant="ghost"
          size="icon-sm"
          className="rounded-none"
          aria-label={ariaLabel}
        />
      }
      className={cn(
        "rounded-none border-0 border-r bg-transparent shadow-none hover:bg-accent",
        className,
      )}
      {...props}
    >
      <Minus />
    </NumberFieldPrimitive.Decrement>
  );
}

function NumberFieldIncrement({
  className,
  "aria-label": ariaLabel = "Increase value",
  ...props
}: React.ComponentProps<typeof NumberFieldPrimitive.Increment>) {
  return (
    <NumberFieldPrimitive.Increment
      data-slot="number-field-increment"
      aria-label={ariaLabel}
      render={
        <Button
          variant="ghost"
          size="icon-sm"
          className="rounded-none"
          aria-label={ariaLabel}
        />
      }
      className={cn(
        "rounded-none border-0 border-l bg-transparent shadow-none hover:bg-accent",
        className,
      )}
      {...props}
    >
      <Plus />
    </NumberFieldPrimitive.Increment>
  );
}

function NumberFieldScrubArea({
  className,
  children,
  "aria-label": ariaLabel,
  ...props
}: React.ComponentProps<typeof NumberFieldPrimitive.ScrubArea>) {
  const labelId = React.useContext(NumberFieldLabelIdContext);
  const labelText =
    ariaLabel ?? (typeof children === "string" ? String(children) : undefined);

  return (
    <NumberFieldPrimitive.ScrubArea
      data-slot="number-field-scrub-area"
      aria-label={labelId ? undefined : labelText}
      aria-labelledby={labelId && labelText ? labelId : undefined}
      className={cn(
        "inline-flex cursor-ew-resize select-none items-center gap-2 rounded-md border px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground",
        className,
      )}
      {...props}
    >
      <MoveHorizontal className="size-4" />
      {labelText && labelId ? <span id={labelId}>{children}</span> : children}
    </NumberFieldPrimitive.ScrubArea>
  );
}

function NumberFieldPatternCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

export {
  NumberField,
  NumberFieldDecrement,
  NumberFieldGroup,
  NumberFieldIncrement,
  NumberFieldInput,
  NumberFieldPatternCard,
  NumberFieldScrubArea,
  RotateCcw,
};
