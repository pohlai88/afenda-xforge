"use client";

import type * as React from "react";

import { cn } from "../../lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui-shadcn/card";

export function ComposePatternCard({
  title,
  description,
  className,
  children,
}: {
  title: string;
  description?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Card className={className}>
      <CardHeader className="space-y-1">
        <CardTitle>{title}</CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

export function ComposePatternStage({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex min-h-[220px] items-center justify-center rounded-lg bg-muted/40 p-6",
        className,
      )}
    >
      {children}
    </div>
  );
}
