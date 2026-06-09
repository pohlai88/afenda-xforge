"use client";

import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";
import { Tabs as TabsPrimitive } from "radix-ui";
import * as React from "react";

import { cn } from "../../../lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../ui-shadcn/card";

type TabsVariant = "default" | "button" | "pill" | "line";
type TabsSize = "xs" | "sm" | "md" | "lg";

type TabsContextValue = {
  variant: TabsVariant;
  size: TabsSize;
  orientation: "horizontal" | "vertical";
};

const TabsContext = React.createContext<TabsContextValue>({
  variant: "default",
  size: "md",
  orientation: "horizontal",
});

const tabsListVariants = cva(
  "group/tabs-list inline-flex w-fit items-center justify-center text-muted-foreground group-data-[orientation=horizontal]/tabs:h-9 group-data-[orientation=vertical]/tabs:h-fit group-data-[orientation=vertical]/tabs:flex-col",
  {
    variants: {
      variant: {
        default: "rounded-lg bg-muted p-[3px]",
        button:
          "gap-2 rounded-xl border border-border bg-background p-1 shadow-xs dark:bg-input/30",
        pill: "gap-1.5 rounded-full bg-muted p-1",
        line: "gap-1 rounded-none border-b bg-transparent p-0",
      },
      size: {
        xs: "h-7 p-0.5",
        sm: "h-8 p-1",
        md: "h-9 p-[3px]",
        lg: "h-10 p-1.5",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  },
);

const tabsTriggerVariants = cva(
  "relative inline-flex flex-1 items-center justify-center gap-1.5 rounded-md border border-transparent font-medium whitespace-nowrap text-foreground/60 transition-all group-data-[orientation=vertical]/tabs:w-full group-data-[orientation=vertical]/tabs:justify-start hover:text-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-1 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-50 dark:text-muted-foreground dark:hover:text-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "data-[state=active]:bg-background data-[state=active]:text-foreground dark:data-[state=active]:border-input dark:data-[state=active]:bg-input/30 dark:data-[state=active]:text-foreground group-data-[variant=default]/tabs-list:data-[state=active]:shadow-sm",
        button:
          "rounded-lg border-border bg-background shadow-xs data-[state=active]:border-primary data-[state=active]:bg-primary data-[state=active]:text-primary-foreground dark:bg-input/20",
        pill: "rounded-full bg-transparent data-[state=active]:bg-foreground data-[state=active]:text-background dark:data-[state=active]:bg-foreground dark:data-[state=active]:text-background",
        line: "rounded-none bg-transparent data-[state=active]:text-foreground after:absolute after:bg-foreground after:opacity-0 after:transition-opacity group-data-[orientation=horizontal]/tabs:after:inset-x-0 group-data-[orientation=horizontal]/tabs:after:bottom-[-5px] group-data-[orientation=horizontal]/tabs:after:h-0.5 group-data-[orientation=vertical]/tabs:after:inset-y-0 group-data-[orientation=vertical]/tabs:after:-right-1 group-data-[orientation=vertical]/tabs:after:w-0.5 group-data-[variant=line]/tabs-list:data-[state=active]:after:opacity-100",
      },
      size: {
        xs: "h-6 px-2 text-xs",
        sm: "h-7 px-2.5 text-sm",
        md: "h-8 px-3 text-sm",
        lg: "h-10 px-4 text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  },
);

function Tabs({
  className,
  orientation = "horizontal",
  variant = "default",
  size = "md",
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root> & {
  variant?: TabsVariant;
  size?: TabsSize;
}) {
  return (
    <TabsContext.Provider value={{ variant, size, orientation }}>
      <TabsPrimitive.Root
        data-slot="tabs"
        data-orientation={orientation}
        data-variant={variant}
        data-size={size}
        orientation={orientation}
        className={cn(
          "group/tabs flex gap-2 data-[orientation=horizontal]:flex-col",
          className,
        )}
        {...props}
      />
    </TabsContext.Provider>
  );
}

function TabsList({
  className,
  variant,
  size,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List> &
  VariantProps<typeof tabsListVariants> & {
    size?: TabsSize;
  }) {
  const context = React.useContext(TabsContext);
  const resolvedVariant = variant ?? context.variant;
  const resolvedSize = size ?? context.size;

  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      data-variant={resolvedVariant}
      data-size={resolvedSize}
      className={cn(
        tabsListVariants({ variant: resolvedVariant, size: resolvedSize }),
        className,
      )}
      {...props}
    />
  );
}

function TabsTrigger({
  className,
  variant,
  size,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger> &
  VariantProps<typeof tabsTriggerVariants> & {
    size?: TabsSize;
  }) {
  const context = React.useContext(TabsContext);
  const resolvedVariant = variant ?? context.variant;
  const resolvedSize = size ?? context.size;

  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      data-variant={resolvedVariant}
      data-size={resolvedSize}
      className={cn(
        tabsTriggerVariants({ variant: resolvedVariant, size: resolvedSize }),
        className,
      )}
      {...props}
    />
  );
}

function TabsContent({
  className,
  variant,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content> & {
  variant?: TabsVariant;
}) {
  const context = React.useContext(TabsContext);
  const resolvedVariant = variant ?? context.variant;

  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      data-variant={resolvedVariant}
      className={cn("flex-1 outline-none", className)}
      {...props}
    />
  );
}

function TabsPatternCard({
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
  Tabs,
  TabsContent,
  TabsList,
  TabsPatternCard,
  TabsTrigger,
  tabsListVariants,
  tabsTriggerVariants,
};
