"use client";

import { Autocomplete as AutocompletePrimitive } from "@base-ui/react/autocomplete";
import { ChevronDownIcon, XIcon } from "lucide-react";
import type * as React from "react";
import { cn } from "../../../lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../ui-shadcn/card";

type AutocompleteSize = "sm" | "default" | "lg";

type ClassNameProp<State> =
  | string
  | ((state: State) => string | undefined)
  | undefined;

function mergeClassName<State>(
  baseClassName: string,
  className?: ClassNameProp<State>,
) {
  if (typeof className === "function") {
    return (state: State) => cn(baseClassName, className(state));
  }

  return cn(baseClassName, className);
}

function inputGroupSizeClassName(size: AutocompleteSize) {
  switch (size) {
    case "sm":
      return "h-8";
    case "lg":
      return "h-11";
    default:
      return "h-9";
  }
}

function inputSizeClassName(size: AutocompleteSize, grouped: boolean) {
  if (grouped) {
    switch (size) {
      case "sm":
        return "px-2.5 py-1.5 text-sm";
      case "lg":
        return "px-4 py-2 text-base";
      default:
        return "px-3 py-1.5 text-sm";
    }
  }

  switch (size) {
    case "sm":
      return "h-8 px-2.5 py-1.5 text-sm";
    case "lg":
      return "h-11 px-4 py-2 text-base";
    default:
      return "h-9 px-3 py-1 text-sm";
  }
}

const Autocomplete = AutocompletePrimitive.Root;

function AutocompletePatternCard({
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

function AutocompleteInputGroup({
  className,
  size = "default",
  ...props
}: React.ComponentProps<typeof AutocompletePrimitive.InputGroup> & {
  size?: AutocompleteSize;
}) {
  return (
    <AutocompletePrimitive.InputGroup
      data-slot="autocomplete-input-group"
      className={mergeClassName<AutocompletePrimitive.InputGroup.State>(
        cn(
          "relative flex w-full min-w-0 items-center rounded-md border border-input bg-transparent shadow-xs transition-[color,box-shadow] outline-none dark:bg-input/30",
          inputGroupSizeClassName(size),
        ),
        className,
      )}
      {...props}
    />
  );
}

function AutocompleteInput({
  className,
  grouped = false,
  inputSize = "default",
  ...props
}: React.ComponentProps<typeof AutocompletePrimitive.Input> & {
  grouped?: boolean;
  inputSize?: AutocompleteSize;
}) {
  return (
    <AutocompletePrimitive.Input
      data-slot="autocomplete-input"
      className={mergeClassName(
        cn(
          "min-w-0 bg-transparent outline-none placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
          grouped
            ? "flex-1 rounded-none border-0 shadow-none focus-visible:ring-0 dark:bg-transparent"
            : "w-full rounded-md border border-input bg-transparent shadow-xs transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 dark:bg-input/30",
          inputSizeClassName(inputSize, grouped),
        ),
        className,
      )}
      {...props}
    />
  );
}

function AutocompleteTrigger({
  className,
  children,
  "aria-label": ariaLabel = "Open suggestions",
  ...props
}: React.ComponentProps<typeof AutocompletePrimitive.Trigger>) {
  return (
    <AutocompletePrimitive.Trigger
      data-slot="autocomplete-trigger"
      aria-label={ariaLabel}
      className={mergeClassName(
        "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors outline-none hover:bg-accent hover:text-accent-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50",
        className,
      )}
      {...props}
    >
      {children}
      <ChevronDownIcon className="pointer-events-none size-4" />
    </AutocompletePrimitive.Trigger>
  );
}

function AutocompleteClear({
  className,
  children,
  "aria-label": ariaLabel = "Clear input",
  ...props
}: React.ComponentProps<typeof AutocompletePrimitive.Clear>) {
  return (
    <AutocompletePrimitive.Clear
      data-slot="autocomplete-clear"
      aria-label={ariaLabel}
      className={mergeClassName(
        "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors outline-none hover:bg-accent hover:text-accent-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 data-[visible=false]:pointer-events-none data-[visible=false]:opacity-0",
        className,
      )}
      {...props}
    >
      {children ?? <XIcon className="pointer-events-none size-4" />}
    </AutocompletePrimitive.Clear>
  );
}

function AutocompleteValue({
  ...props
}: React.ComponentProps<typeof AutocompletePrimitive.Value>) {
  return (
    <AutocompletePrimitive.Value data-slot="autocomplete-value" {...props} />
  );
}

function AutocompleteContent({
  className,
  side = "bottom",
  sideOffset = 6,
  align = "start",
  alignOffset = 0,
  children,
  ...props
}: Omit<
  React.ComponentProps<typeof AutocompletePrimitive.Positioner>,
  "children"
> &
  Omit<React.ComponentProps<typeof AutocompletePrimitive.Popup>, "children"> & {
    children: React.ReactNode;
  }) {
  return (
    <AutocompletePrimitive.Portal data-slot="autocomplete-portal">
      <AutocompletePrimitive.Positioner
        side={side}
        sideOffset={sideOffset}
        align={align}
        alignOffset={alignOffset}
        className="isolate z-50"
      >
        <AutocompletePrimitive.Popup
          data-slot="autocomplete-content"
          className={mergeClassName<AutocompletePrimitive.Popup.State>(
            "group/autocomplete-content relative w-[var(--anchor-width)] max-w-[var(--available-width)] min-w-72 overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md ring-1 ring-border/50",
            className,
          )}
          {...props}
        >
          {children}
        </AutocompletePrimitive.Popup>
      </AutocompletePrimitive.Positioner>
    </AutocompletePrimitive.Portal>
  );
}

function AutocompleteList({
  className,
  ...props
}: React.ComponentProps<typeof AutocompletePrimitive.List>) {
  return (
    <AutocompletePrimitive.List
      data-slot="autocomplete-list"
      className={mergeClassName<AutocompletePrimitive.List.State>(
        "max-h-80 scroll-py-1 overflow-y-auto p-1 data-empty:p-0",
        className,
      )}
      {...props}
    />
  );
}

function AutocompleteEmpty({
  className,
  ...props
}: React.ComponentProps<typeof AutocompletePrimitive.Empty>) {
  return (
    <AutocompletePrimitive.Empty
      data-slot="autocomplete-empty"
      className={mergeClassName<AutocompletePrimitive.Empty.State>(
        "w-full justify-center px-3 py-6 text-center text-sm text-muted-foreground",
        className,
      )}
      {...props}
    />
  );
}

function AutocompleteStatus({
  className,
  ...props
}: React.ComponentProps<typeof AutocompletePrimitive.Status>) {
  return (
    <AutocompletePrimitive.Status
      data-slot="autocomplete-status"
      className={mergeClassName<AutocompletePrimitive.Status.State>(
        "px-3 py-2 text-sm text-muted-foreground",
        className,
      )}
      {...props}
    />
  );
}

function AutocompleteItem({
  className,
  ...props
}: React.ComponentProps<typeof AutocompletePrimitive.Item>) {
  return (
    <AutocompletePrimitive.Item
      data-slot="autocomplete-item"
      className={mergeClassName(
        "relative flex w-full cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none select-none data-highlighted:bg-accent data-highlighted:text-accent-foreground data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

function AutocompleteGroup({
  className,
  ...props
}: React.ComponentProps<typeof AutocompletePrimitive.Group>) {
  return (
    <AutocompletePrimitive.Group
      data-slot="autocomplete-group"
      className={mergeClassName<AutocompletePrimitive.Group.State>(
        "px-1 py-1",
        className,
      )}
      {...props}
    />
  );
}

function AutocompleteLabel({
  className,
  ...props
}: React.ComponentProps<typeof AutocompletePrimitive.GroupLabel>) {
  return (
    <AutocompletePrimitive.GroupLabel
      data-slot="autocomplete-label"
      className={mergeClassName<AutocompletePrimitive.GroupLabel.State>(
        "px-2 py-1.5 text-xs font-medium text-muted-foreground",
        className,
      )}
      {...props}
    />
  );
}

function AutocompleteCollection({
  ...props
}: React.ComponentProps<typeof AutocompletePrimitive.Collection>) {
  return (
    <AutocompletePrimitive.Collection
      data-slot="autocomplete-collection"
      {...props}
    />
  );
}

function AutocompleteSeparator({
  className,
  ...props
}: React.ComponentProps<typeof AutocompletePrimitive.Separator>) {
  return (
    <AutocompletePrimitive.Separator
      data-slot="autocomplete-separator"
      className={mergeClassName<AutocompletePrimitive.Separator.State>(
        "-mx-1 my-1 h-px bg-border",
        className,
      )}
      {...props}
    />
  );
}

export {
  Autocomplete,
  AutocompleteClear,
  AutocompleteCollection,
  AutocompleteContent,
  AutocompleteEmpty,
  AutocompleteGroup,
  AutocompleteInput,
  AutocompleteInputGroup,
  AutocompleteItem,
  AutocompleteLabel,
  AutocompleteList,
  AutocompletePatternCard,
  AutocompleteSeparator,
  AutocompleteStatus,
  AutocompleteTrigger,
  AutocompleteValue,
};
