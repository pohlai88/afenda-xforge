"use client";

import { CircleX } from "lucide-react";
import {
  Alert,
  AlertDescription,
  AlertPatternCard,
  AlertTitle,
} from "./alert.shared";

export function DestructiveAlert() {
  return (
    <AlertPatternCard title="Destructive alert">
      <Alert variant="destructive">
        <CircleX />
        <AlertTitle>Error! Something went wrong</AlertTitle>
        <AlertDescription>
          Please try again. If the problem persists, contact support.
        </AlertDescription>
      </Alert>
    </AlertPatternCard>
  );
}
