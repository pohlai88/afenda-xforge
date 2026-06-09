"use client";

import { TriangleAlert } from "lucide-react";
import {
  Alert,
  AlertDescription,
  AlertPatternCard,
  AlertTitle,
} from "./alert.shared";

export function WarningAlert() {
  return (
    <AlertPatternCard title="Warning alert">
      <Alert variant="warning">
        <TriangleAlert />
        <AlertTitle>Warning! Something is wrong</AlertTitle>
        <AlertDescription>
          Please check your settings. If the problem persists, contact support.
        </AlertDescription>
      </Alert>
    </AlertPatternCard>
  );
}
