"use client";

import * as React from "react";

import { cn } from "../../lib/utils";

type TimelineOrientation = "horizontal" | "vertical";

type TimelineContextValue = {
  value: number;
  orientation: TimelineOrientation;
  setValue: (value: number) => void;
};

type TimelineItemContextValue = {
  step: number;
  active: boolean;
  orientation: TimelineOrientation;
};

const TimelineContext = React.createContext<TimelineContextValue | null>(null);
const TimelineItemContext =
  React.createContext<TimelineItemContextValue | null>(null);

function useTimelineContext() {
  const context = React.useContext(TimelineContext);

  if (!context) {
    throw new Error("Timeline components must be used within <Timeline />");
  }

  return context;
}

function useTimelineItemContext() {
  const context = React.useContext(TimelineItemContext);

  if (!context) {
    throw new Error(
      "Timeline subcomponents must be used within <TimelineItem />",
    );
  }

  return context;
}

function Timeline({
  className,
  orientation = "vertical",
  defaultValue = 1,
  value,
  onValueChange,
  ...props
}: React.ComponentProps<"div"> & {
  defaultValue?: number;
  value?: number;
  onValueChange?: (value: number) => void;
  orientation?: TimelineOrientation;
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

  return (
    <TimelineContext.Provider
      value={{ value: currentValue, orientation, setValue }}
    >
      <div
        data-slot="timeline"
        data-orientation={orientation}
        className={cn(
          "flex gap-6",
          orientation === "vertical" ? "flex-col" : "flex-row overflow-x-auto",
          className,
        )}
        {...props}
      />
    </TimelineContext.Provider>
  );
}

function TimelineItem({
  className,
  step,
  ...props
}: Omit<React.ComponentProps<"div">, "onClick"> & {
  step: number;
}) {
  const timeline = useTimelineContext();
  const active = step === timeline.value;

  return (
    <TimelineItemContext.Provider
      value={{ step, active, orientation: timeline.orientation }}
    >
      <div
        data-slot="timeline-item"
        data-step={step}
        data-state={active ? "active" : "inactive"}
        data-orientation={timeline.orientation}
        aria-current={active ? "step" : undefined}
        className={cn("relative", className)}
        {...props}
      />
    </TimelineItemContext.Provider>
  );
}

function TimelineDate({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="timeline-date"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  );
}

function TimelineTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="timeline-title"
      className={cn("text-sm font-medium text-foreground", className)}
      {...props}
    />
  );
}

function TimelineHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="timeline-header"
      className={cn("grid gap-1", className)}
      {...props}
    />
  );
}

function TimelineIndicator({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const { active } = useTimelineItemContext();

  return (
    <div
      data-slot="timeline-indicator"
      data-state={active ? "active" : "inactive"}
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full border border-background bg-primary text-primary-foreground shadow-sm",
        "size-3 data-[state=inactive]:bg-muted-foreground/35",
        className,
      )}
      {...props}
    />
  );
}

function TimelineSeparator({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const { orientation } = useTimelineItemContext();

  return (
    <div
      data-slot="timeline-separator"
      data-orientation={orientation}
      className={cn(
        "shrink-0 bg-border",
        orientation === "vertical" ? "min-h-8 w-px" : "h-px min-w-8 flex-1",
        className,
      )}
      {...props}
    />
  );
}

function TimelineContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="timeline-content"
      className={cn("text-sm leading-6 text-muted-foreground", className)}
      {...props}
    />
  );
}

export {
  Timeline,
  TimelineContent,
  TimelineDate,
  TimelineHeader,
  TimelineIndicator,
  TimelineItem,
  TimelineSeparator,
  TimelineTitle,
};
