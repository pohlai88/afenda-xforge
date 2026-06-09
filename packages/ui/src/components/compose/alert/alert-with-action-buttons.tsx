"use client";

import { Button } from "../../ui-shadcn/button";
import {
  Alert,
  AlertAction,
  AlertPatternCard,
  AlertTitle,
} from "./alert.shared";

export function AlertWithActionButtons() {
  return (
    <AlertPatternCard title="Alert with action buttons">
      <Alert>
        <AlertTitle>Security Update</AlertTitle>
        <AlertAction>
          <Button variant="outline" size="sm">
            Dismiss
          </Button>
          <Button size="sm">Update</Button>
        </AlertAction>
      </Alert>
    </AlertPatternCard>
  );
}
