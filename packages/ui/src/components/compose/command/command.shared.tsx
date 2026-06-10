"use client";

import type * as React from "react";

import {
  CommandGroup as CommandGroupPrimitive,
  CommandItem,
  CommandSeparator as CommandSeparatorPrimitive,
} from "../../ui-shadcn/command";

function CommandGroupHeading({ children }: { children: React.ReactNode }) {
  return (
    <div
      cmdk-group-heading=""
      role="presentation"
      className="px-2 py-1.5 text-xs font-medium text-muted-foreground"
    >
      {children}
    </div>
  );
}

function CommandGroup({
  title,
  className,
  children,
  ...props
}: React.ComponentProps<typeof CommandGroupPrimitive> & {
  title: string;
}) {
  return (
    <CommandGroupPrimitive className={className} {...props}>
      <CommandGroupHeading>{title}</CommandGroupHeading>
      {children}
    </CommandGroupPrimitive>
  );
}

function CommandSeparator({
  className,
  ...props
}: React.ComponentProps<typeof CommandSeparatorPrimitive>) {
  return (
    <CommandSeparatorPrimitive
      role="presentation"
      className={className}
      {...props}
    />
  );
}

export { CommandGroup, CommandGroupHeading, CommandItem, CommandSeparator };
