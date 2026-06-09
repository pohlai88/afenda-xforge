"use client";

import {
  Alert,
  AlertDescription,
  AlertPatternCard,
  AlertTitle,
} from "./alert.shared";

export function AlertWithTitleDescription() {
  return (
    <AlertPatternCard title="Alert with title and description">
      <Alert>
        <AlertTitle>Alert!</AlertTitle>
        <AlertDescription>
          This is an alert with a title and description.
        </AlertDescription>
      </Alert>
    </AlertPatternCard>
  );
}
