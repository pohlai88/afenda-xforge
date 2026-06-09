"use client";

import type * as React from "react";

import {
  Alert,
  AlertAction,
  AlertDescription,
  AlertTitle,
} from "../../ui-shadcn/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../ui-shadcn/card";

function AlertPatternCard({
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

export { Alert, AlertAction, AlertDescription, AlertPatternCard, AlertTitle };
