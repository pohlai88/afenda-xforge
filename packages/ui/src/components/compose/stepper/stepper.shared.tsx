"use client";

import { CheckIcon, DotFilledIcon } from "@radix-ui/react-icons";
import { Slot } from "radix-ui";
import * as React from "react";

import { cn } from "../../../lib/utils";

export type StepIndicators = {
  active?: React.ReactNode;
  completed?: React.ReactNode;
  inactive?: React.ReactNode;
  loading?: React.ReactNode;
};

type StepperOrientation = "horizontal" | "vertical";

type StepperContextValue = {
  activeValue: number;
  setActiveValue: (value: number) => void;
  orientation: StepperOrientation;
  indicators?: StepIndicators;
  baseId: string;
};

type StepperItemContextValue = {
  step: number;
  completed: boolean;
  disabled: boolean;
  loading: boolean;
  active: boolean;
};

const StepperContext = React.createContext<StepperContextValue | null>(null);
const StepperItemContext = React.createContext<StepperItemContextValue | null>(
  null,
);

function useControllableNumberState({
  defaultValue,
  value,
  onValueChange,
}: {
  defaultValue: number;
  value?: number;
  onValueChange?: (value: number) => void;
}) {
  const [internalValue, setInternalValue] = React.useState(defaultValue);
  const isControlled = value !== undefined;
  const currentValue = isControlled ? value : internalValue;

  const setValue = React.useCallback(
    (nextValue: number) => {
      if (!isControlled) {
        setInternalValue(nextValue);
      }
      onValueChange?.(nextValue);
    },
    [isControlled, onValueChange],
  );

  return [currentValue, setValue] as const;
}

function useStepperContext() {
  const context = React.useContext(StepperContext);

  if (!context) {
    throw new Error("Stepper components must be used within <Stepper />");
  }

  return context;
}

function useStepperItemContext() {
  const context = React.useContext(StepperItemContext);

  if (!context) {
    throw new Error("Stepper components must be used within <StepperItem />");
  }

  return context;
}

type StepperProps = React.ComponentProps<"div"> & {
  defaultValue?: number;
  value?: number;
  onValueChange?: (value: number) => void;
  orientation?: StepperOrientation;
  indicators?: StepIndicators;
  asChild?: boolean;
};

function Stepper({
  defaultValue = 1,
  value,
  onValueChange,
  orientation = "horizontal",
  indicators,
  asChild = false,
  className,
  style,
  ...props
}: StepperProps) {
  const [activeValue, setActiveValue] = useControllableNumberState({
    defaultValue,
    value,
    onValueChange,
  });
  const baseId = React.useId();
  const Comp = asChild ? Slot.Root : "div";

  return (
    <StepperContext.Provider
      value={{
        activeValue,
        setActiveValue,
        orientation,
        indicators,
        baseId,
      }}
    >
      <Comp
        data-slot="stepper"
        data-orientation={orientation}
        className={cn(
          "flex flex-col gap-4",
          orientation === "vertical" && "gap-5",
          className,
        )}
        style={style}
        {...props}
      />
    </StepperContext.Provider>
  );
}

type StepperNavProps = React.ComponentProps<"ul"> & {
  asChild?: boolean;
};

function StepperNav({ className, asChild = false, ...props }: StepperNavProps) {
  const { orientation } = useStepperContext();
  const Comp = asChild ? Slot.Root : "ul";

  return (
    <Comp
      data-slot="stepper-nav"
      data-orientation={orientation}
      className={cn(
        "m-0 flex list-none items-center p-0",
        orientation === "horizontal" ? "gap-3" : "flex-col items-stretch gap-4",
        className,
      )}
      {...props}
    />
  );
}

type StepperItemProps = React.ComponentProps<"li"> & {
  step: number;
  completed?: boolean;
  disabled?: boolean;
  loading?: boolean;
};

function StepperItem({
  step,
  completed = false,
  disabled = false,
  loading = false,
  className,
  children,
  ...props
}: StepperItemProps) {
  const { activeValue, orientation } = useStepperContext();
  const active = activeValue === step;
  const resolvedCompleted = completed || activeValue > step;
  const state: StepperItemContextValue = {
    step,
    active,
    completed: resolvedCompleted,
    disabled,
    loading,
  };

  return (
    <StepperItemContext.Provider value={state}>
      <li
        data-slot="stepper-item"
        data-state={
          active ? "active" : resolvedCompleted ? "completed" : "inactive"
        }
        data-orientation={orientation}
        data-disabled={disabled ? "true" : undefined}
        className={cn(
          "group/stepper-item flex min-w-0 items-center gap-3",
          orientation === "vertical" && "w-full items-start",
          className,
        )}
        {...props}
      >
        {children}
      </li>
    </StepperItemContext.Provider>
  );
}

type StepperTriggerProps = React.ComponentProps<"button"> & {
  asChild?: boolean;
};

function StepperTrigger({
  className,
  asChild = false,
  onClick,
  ...props
}: StepperTriggerProps) {
  const { activeValue, setActiveValue, baseId } = useStepperContext();
  const { step, disabled } = useStepperItemContext();
  const Comp = asChild ? Slot.Root : "button";
  const triggerId = `stepper-trigger-${baseId}-${step}`;
  const contentId = `stepper-content-${baseId}-${step}`;

  return (
    <Comp
      type={asChild ? undefined : "button"}
      id={triggerId}
      data-slot="stepper-trigger"
      aria-current={step === activeValue ? "step" : undefined}
      aria-controls={contentId}
      disabled={asChild ? undefined : disabled}
      onClick={(event: React.MouseEvent<HTMLElement>) => {
        onClick?.(event as React.MouseEvent<HTMLButtonElement>);
        if (!disabled && !event.defaultPrevented) {
          setActiveValue(step);
        }
      }}
      className={cn(
        "inline-flex min-w-0 items-center gap-3 rounded-full text-left outline-none transition-colors focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

type StepperIndicatorProps = React.ComponentProps<"span">;

function StepperIndicator({
  className,
  children,
  ...props
}: StepperIndicatorProps) {
  const { indicators } = useStepperContext();
  const { step, active, completed, loading } = useStepperItemContext();

  const fallback = loading
    ? (indicators?.loading ?? (
        <span className="border-foreground/40 border-t-transparent size-4 animate-spin rounded-full border-2" />
      ))
    : completed
      ? (indicators?.completed ?? <CheckIcon className="size-4" />)
      : active
        ? (indicators?.active ?? <DotFilledIcon className="size-4" />)
        : (indicators?.inactive ?? step);

  return (
    <span
      data-slot="stepper-indicator"
      data-state={
        loading
          ? "loading"
          : completed
            ? "completed"
            : active
              ? "active"
              : "inactive"
      }
      className={cn(
        "inline-flex size-8 shrink-0 items-center justify-center rounded-full border border-border bg-background text-sm font-medium text-foreground transition-colors group-data-[state=active]/stepper-item:border-primary group-data-[state=active]/stepper-item:bg-primary group-data-[state=active]/stepper-item:text-primary-foreground group-data-[state=completed]/stepper-item:border-primary group-data-[state=completed]/stepper-item:bg-primary group-data-[state=completed]/stepper-item:text-primary-foreground group-data-[state=loading]/stepper-item:border-primary/40",
        className,
      )}
      {...props}
    >
      {children ?? fallback}
    </span>
  );
}

type StepperSeparatorProps = React.ComponentProps<"div">;

function StepperSeparator({ className, ...props }: StepperSeparatorProps) {
  const { orientation } = useStepperContext();

  return (
    <div
      data-slot="stepper-separator"
      aria-hidden="true"
      className={cn(
        "bg-border shrink-0",
        orientation === "horizontal" ? "h-px flex-1" : "ml-4 h-6 w-px",
        className,
      )}
      {...props}
    />
  );
}

function StepperTitle({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="stepper-title"
      className={cn("text-sm font-medium leading-none", className)}
      {...props}
    />
  );
}

function StepperDescription({
  className,
  ...props
}: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="stepper-description"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  );
}

function StepperPanel({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="stepper-panel"
      className={cn("grid gap-4", className)}
      {...props}
    />
  );
}

type StepperContentProps = React.ComponentProps<"section"> & {
  value: number;
  forceMount?: boolean;
};

function StepperContent({
  value,
  forceMount = false,
  className,
  children,
  ...props
}: StepperContentProps) {
  const { activeValue, baseId } = useStepperContext();
  const active = activeValue === value;
  const contentId = `stepper-content-${baseId}-${value}`;
  const triggerId = `stepper-trigger-${baseId}-${value}`;

  if (!forceMount && !active) {
    return (
      <section
        id={contentId}
        data-slot="stepper-content"
        data-state="inactive"
        aria-labelledby={triggerId}
        hidden
        className={cn("hidden", className)}
        {...props}
      />
    );
  }

  return (
    <section
      id={contentId}
      data-slot="stepper-content"
      data-state={active ? "active" : "inactive"}
      aria-labelledby={triggerId}
      hidden={!active}
      className={cn("outline-none", !active && "hidden", className)}
      {...props}
    >
      {children}
    </section>
  );
}

export {
  Stepper,
  StepperContent,
  StepperDescription,
  StepperIndicator,
  StepperItem,
  StepperNav,
  StepperPanel,
  StepperSeparator,
  StepperTitle,
  StepperTrigger,
  useStepperContext,
  useStepperItemContext,
};
