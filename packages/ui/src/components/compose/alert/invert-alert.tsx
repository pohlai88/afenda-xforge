"use client";

import { MoonStar } from "lucide-react";
import {
  Alert,
  AlertDescription,
  AlertPatternCard,
  AlertTitle,
} from "./alert.shared";

export function InvertAlert() {
  return (
    <AlertPatternCard title="Invert alert">
      <Alert variant="invert">
        <MoonStar />
        <AlertTitle>Notification! All good</AlertTitle>
        <AlertDescription>
          This is a notification alert with a title and description.
        </AlertDescription>
      </Alert>
    </AlertPatternCard>
  );
}
