"use client";

import { BellRing } from "lucide-react";
import {
  Alert,
  AlertDescription,
  AlertPatternCard,
  AlertTitle,
} from "./alert.shared";

export function NotificationAlert() {
  return (
    <AlertPatternCard title="Notification alert">
      <Alert variant="invert">
        <BellRing />
        <AlertTitle>Notification! All good</AlertTitle>
        <AlertDescription>
          This is a notification alert with a title and description.
        </AlertDescription>
      </Alert>
    </AlertPatternCard>
  );
}
