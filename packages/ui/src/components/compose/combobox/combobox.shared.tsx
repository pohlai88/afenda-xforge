"use client";

import { Combobox as ComboboxPrimitive } from "@base-ui/react";
import { XIcon } from "lucide-react";
import type * as React from "react";
import { cn } from "../../../lib/utils";
import { Button } from "../../ui-shadcn/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../ui-shadcn/card";
import {
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxClear as ComboboxClearPrimitive,
  ComboboxCollection,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxItem,
  ComboboxLabel,
  ComboboxList,
  Combobox as ComboboxRoot,
  ComboboxSeparator,
  ComboboxTrigger as ComboboxTriggerPrimitive,
  ComboboxValue,
  useComboboxAnchor,
} from "../../ui-shadcn/combobox";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "../../ui-shadcn/input-group";

const Combobox = ComboboxRoot;

function ComboboxTrigger({
  "aria-label": ariaLabel = "Open options",
  ...props
}: React.ComponentProps<typeof ComboboxTriggerPrimitive>) {
  return <ComboboxTriggerPrimitive aria-label={ariaLabel} {...props} />;
}

function ComboboxClear({
  "aria-label": ariaLabel = "Clear selection",
  ...props
}: React.ComponentProps<typeof ComboboxClearPrimitive>) {
  return (
    <ComboboxClearPrimitive
      aria-label={ariaLabel}
      render={
        <InputGroupButton
          variant="ghost"
          size="icon-xs"
          aria-label={ariaLabel}
        />
      }
      {...props}
    />
  );
}

function ComboboxInput({
  className,
  children,
  disabled = false,
  showTrigger = true,
  showClear = false,
  triggerAriaLabel = "Open options",
  clearAriaLabel = "Clear selection",
  ...props
}: ComboboxPrimitive.Input.Props & {
  showTrigger?: boolean;
  showClear?: boolean;
  triggerAriaLabel?: string;
  clearAriaLabel?: string;
}) {
  return (
    <InputGroup className={cn("w-auto", className)}>
      <ComboboxPrimitive.Input
        render={<InputGroupInput disabled={disabled} />}
        {...props}
      />
      <InputGroupAddon align="inline-end">
        {showTrigger ? (
          <InputGroupButton
            size="icon-xs"
            variant="ghost"
            asChild
            aria-label={triggerAriaLabel}
            data-slot="input-group-button"
            className="group-has-data-[slot=combobox-clear]/input-group:hidden data-pressed:bg-transparent"
            disabled={disabled}
          >
            <ComboboxTrigger aria-label={triggerAriaLabel} />
          </InputGroupButton>
        ) : null}
        {showClear ? (
          <ComboboxClear aria-label={clearAriaLabel} disabled={disabled} />
        ) : null}
      </InputGroupAddon>
      {children}
    </InputGroup>
  );
}

function ComboboxChip({
  className,
  children,
  showRemove = true,
  removeAriaLabel = "Remove",
  ...props
}: ComboboxPrimitive.Chip.Props & {
  showRemove?: boolean;
  removeAriaLabel?: string;
}) {
  return (
    <ComboboxPrimitive.Chip
      data-slot="combobox-chip"
      className={cn(
        "flex h-[calc(--spacing(5.5))] w-fit items-center justify-center gap-1 rounded-sm bg-muted px-1.5 text-xs font-medium whitespace-nowrap text-foreground has-disabled:pointer-events-none has-disabled:cursor-not-allowed has-disabled:opacity-50 has-data-[slot=combobox-chip-remove]:pr-0",
        className,
      )}
      {...props}
    >
      {children}
      {showRemove ? (
        <ComboboxPrimitive.ChipRemove
          render={
            <Button
              variant="ghost"
              size="icon-xs"
              aria-label={removeAriaLabel}
            />
          }
          className="-ml-1 opacity-50 hover:opacity-100"
          data-slot="combobox-chip-remove"
        >
          <XIcon className="pointer-events-none" />
        </ComboboxPrimitive.ChipRemove>
      ) : null}
    </ComboboxPrimitive.Chip>
  );
}

function ComboboxPatternCard({
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

function ComboboxItemRow({
  value,
  title,
  description,
  leading,
  trailing,
  className,
  itemClassName,
}: {
  value: string;
  title: string;
  description?: string;
  leading?: React.ReactNode;
  trailing?: React.ReactNode;
  className?: string;
  itemClassName?: string;
}) {
  return (
    <ComboboxItem value={value} className={cn("py-2", itemClassName)}>
      <div className={cn("flex min-w-0 flex-1 items-center gap-3", className)}>
        {leading}
        <div className="min-w-0 flex-1">
          <div className="text-sm font-medium">{title}</div>
          {description ? (
            <div className="text-xs text-muted-foreground">{description}</div>
          ) : null}
        </div>
        {trailing}
      </div>
    </ComboboxItem>
  );
}

export {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxClear,
  ComboboxCollection,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxItemRow,
  ComboboxLabel,
  ComboboxList,
  ComboboxPatternCard,
  ComboboxSeparator,
  ComboboxTrigger,
  ComboboxValue,
  useComboboxAnchor,
};
