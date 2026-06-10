"use client";

import type * as React from "react";

import { cn } from "../../../lib/utils";
import { Badge } from "../../ui-shadcn/badge";

export function ChartTrendBadge({
  tone = "success",
  className,
  children,
}: {
  tone?: "success" | "warning" | "destructive";
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Badge
      variant="outline"
      className={cn(
        tone === "success"
          ? "border-transparent bg-success-muted text-success-muted-foreground"
          : tone === "warning"
            ? "border-transparent bg-warning-muted text-warning-muted-foreground"
            : "border-transparent bg-destructive-muted text-destructive-muted-foreground",
        className,
      )}
    >
      {children}
    </Badge>
  );
}

export {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../ui-shadcn/card";
export {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartStyle,
  ChartTooltip,
  ChartTooltipContent,
} from "../../ui-shadcn/chart";
