"use client";

import type * as React from "react";
import { cn } from "../../../lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../ui-shadcn/card";
import { Checkbox } from "../../ui-shadcn/checkbox";
import { Label } from "../../ui-shadcn/label";

type CheckboxState = React.ComponentProps<typeof Checkbox>["checked"];
type CheckboxChange = React.ComponentProps<typeof Checkbox>["onCheckedChange"];

function CheckboxPatternCard({
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

function CheckboxList({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn("grid gap-3", className)}>{children}</div>;
}

function CheckboxFrame({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border/70 bg-background/60 p-4 shadow-sm",
        className,
      )}
    >
      {children}
    </div>
  );
}

function CheckboxOption({
  id,
  title,
  description,
  checked,
  disabled,
  invalid,
  className,
  labelClassName,
  descriptionClassName,
  checkboxClassName,
  leading,
  trailing,
  onCheckedChange,
}: {
  id: string;
  title: string;
  description?: string;
  checked?: CheckboxState;
  disabled?: boolean;
  invalid?: boolean;
  className?: string;
  labelClassName?: string;
  descriptionClassName?: string;
  checkboxClassName?: string;
  leading?: React.ReactNode;
  trailing?: React.ReactNode;
  onCheckedChange?: CheckboxChange;
}) {
  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-lg border border-border/70 bg-background p-3",
        disabled && "opacity-60",
        className,
      )}
    >
      <Checkbox
        aria-invalid={invalid || undefined}
        checked={checked}
        className={cn("mt-0.5", checkboxClassName)}
        disabled={disabled}
        id={id}
        onCheckedChange={onCheckedChange}
      />
      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex items-center gap-2">
          <Label htmlFor={id} className={cn("font-medium", labelClassName)}>
            {title}
          </Label>
          {leading}
        </div>
        {description ? (
          <p
            className={cn(
              "text-sm text-muted-foreground",
              descriptionClassName,
            )}
          >
            {description}
          </p>
        ) : null}
      </div>
      {trailing}
    </div>
  );
}

export {
  Checkbox,
  CheckboxFrame,
  CheckboxList,
  CheckboxOption,
  CheckboxPatternCard,
  Label,
};
