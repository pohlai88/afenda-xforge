"use client";

import { Button } from "../../ui-shadcn/button";
import {
  Alert,
  AlertAction,
  AlertPatternCard,
  AlertTitle,
} from "./alert.shared";

export function AlertWithTitleAndActionButtons() {
  return (
    <AlertPatternCard title="Alert with title and action buttons">
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
