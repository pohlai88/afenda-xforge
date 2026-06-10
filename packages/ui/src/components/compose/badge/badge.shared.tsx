"use client";

import type * as React from "react";

import { cn } from "../../../lib/utils";
import { Badge } from "../../ui-shadcn/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../ui-shadcn/card";

function BadgePatternCard({
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

function BadgeDot({ className }: { className?: string }) {
  return <span aria-hidden="true" className={className} />;
}

const badgeToneClassName = {
  success: "border-transparent bg-success-muted text-success-muted-foreground",
  warning: "border-transparent bg-warning-muted text-warning-muted-foreground",
  destructive:
    "border-transparent bg-destructive-muted text-destructive-muted-foreground",
  info: "border-transparent bg-info-muted text-info-muted-foreground",
} as const;

const badgeOutlineToneClassName = {
  success: "border-border bg-background text-success-muted-foreground",
  warning: "border-border bg-background text-warning-muted-foreground",
  destructive: "border-border bg-background text-destructive-muted-foreground",
  info: "border-border bg-background text-info-muted-foreground",
} as const;

function StatusBadge({
  tone,
  className,
  children,
  ...props
}: React.ComponentProps<typeof Badge> & {
  tone: keyof typeof badgeToneClassName;
}) {
  return (
    <Badge
      variant="outline"
      className={cn(badgeToneClassName[tone], className)}
      {...props}
    >
      {children}
    </Badge>
  );
}

function OutlineStatusBadge({
  tone,
  className,
  children,
  ...props
}: React.ComponentProps<typeof Badge> & {
  tone: keyof typeof badgeOutlineToneClassName;
}) {
  return (
    <Badge
      variant="outline"
      className={cn(badgeOutlineToneClassName[tone], className)}
      {...props}
    >
      {children}
    </Badge>
  );
}

export {
  Badge,
  BadgeDot,
  BadgePatternCard,
  OutlineStatusBadge,
  StatusBadge,
  badgeOutlineToneClassName,
  badgeToneClassName,
};
