"use client";

import { ChevronDown, ChevronRight } from "lucide-react";
import { Accordion as AccordionPrimitive } from "radix-ui";
import * as React from "react";

import { cn } from "../../../lib/utils";

function Accordion({
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Root>) {
  return <AccordionPrimitive.Root data-slot="accordion" {...props} />;
}

function AccordionItem({
  className,
  value,
  ...props
}: Omit<React.ComponentProps<typeof AccordionPrimitive.Item>, "value"> & {
  value?: string;
}) {
  const generatedValue = React.useId();

  return (
    <AccordionPrimitive.Item
      data-slot="accordion-item"
      className={cn("border-b last:border-b-0", className)}
      value={value ?? generatedValue}
      {...props}
    />
  );
}

function AccordionHeader({
  className,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Header>) {
  return (
    <AccordionPrimitive.Header className={cn("flex", className)} {...props} />
  );
}

function AccordionTriggerBase({
  className,
  children,
  indicator,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Trigger> & {
  indicator?: React.ReactNode;
}) {
  return (
    <AccordionHeader>
      <AccordionPrimitive.Trigger
        data-slot="accordion-trigger"
        className={cn(
          "group flex flex-1 items-start justify-between gap-4 rounded-md py-4 text-left text-sm font-medium transition-all outline-none hover:underline focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50",
          className,
        )}
        {...props}
      >
        {children}
        {indicator ?? (
          <ChevronDown className="pointer-events-none size-4 shrink-0 translate-y-0.5 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180" />
        )}
      </AccordionPrimitive.Trigger>
    </AccordionHeader>
  );
}

function AccordionTriggerShell({
  className,
  children,
  indicator,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Trigger> & {
  indicator?: React.ReactNode;
}) {
  return (
    <AccordionTriggerBase
      className={className}
      indicator={indicator}
      {...props}
    >
      {children}
    </AccordionTriggerBase>
  );
}

function AccordionContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Content>) {
  return (
    <AccordionPrimitive.Content
      data-slot="accordion-content"
      className="overflow-hidden text-sm data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down"
      {...props}
    >
      <div className={cn("pt-0 pb-4", className)}>{children}</div>
    </AccordionPrimitive.Content>
  );
}

function AccordionSection({
  title,
  children,
  badge,
  icon,
  triggerClassName,
  contentClassName,
  indicator,
  value,
}: {
  title: string;
  children: React.ReactNode;
  badge?: React.ReactNode;
  icon?: React.ReactNode;
  triggerClassName?: string;
  contentClassName?: string;
  indicator?: React.ReactNode;
  value?: string;
}) {
  return (
    <AccordionItem value={value}>
      <AccordionTriggerShell
        className={triggerClassName}
        indicator={
          indicator ?? (
            <ChevronDown className="size-4 shrink-0 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180" />
          )
        }
      >
        <span className="flex min-w-0 flex-1 items-center gap-3">
          {icon ? <span className="text-muted-foreground">{icon}</span> : null}
          <span className="min-w-0 truncate">{title}</span>
        </span>
        {badge ? <span className="shrink-0">{badge}</span> : null}
      </AccordionTriggerShell>
      <AccordionContent className={contentClassName}>
        {children}
      </AccordionContent>
    </AccordionItem>
  );
}

function Frame({ children }: { children: React.ReactNode }) {
  return <div className="rounded-xl border border-dashed">{children}</div>;
}

function FramePanel({ title, body }: { title: string; body: React.ReactNode }) {
  return (
    <AccordionItem>
      <AccordionTriggerShell
        className="px-4"
        indicator={
          <ChevronRight className="size-4 shrink-0 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-90" />
        }
      >
        {title}
      </AccordionTriggerShell>
      <AccordionContent className="px-4">{body}</AccordionContent>
    </AccordionItem>
  );
}

export {
  Accordion,
  AccordionContent,
  AccordionHeader,
  AccordionItem,
  AccordionSection,
  AccordionTriggerBase,
  AccordionTriggerShell,
  Frame,
  FramePanel,
};
