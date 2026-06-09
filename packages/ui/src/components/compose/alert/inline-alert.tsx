"use client";

import { CircleAlert } from "lucide-react";
import {
  Alert,
  AlertDescription,
  AlertPatternCard,
  AlertTitle,
} from "./alert.shared";

export function InlineAlert() {
  return (
    <AlertPatternCard title="Inline alert">
      <Alert>
        <CircleAlert />
        <AlertTitle>Heads up</AlertTitle>
        <AlertDescription>
          This alert is designed to sit inline with content without taking over
          the page.
        </AlertDescription>
      </Alert>
    </AlertPatternCard>
  );
}
