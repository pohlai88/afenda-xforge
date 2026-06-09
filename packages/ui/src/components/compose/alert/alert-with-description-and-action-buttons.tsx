"use client";

import { Button } from "../../ui-shadcn/button";
import {
  Alert,
  AlertAction,
  AlertDescription,
  AlertPatternCard,
} from "./alert.shared";

export function AlertWithDescriptionAndActionButtons() {
  return (
    <AlertPatternCard title="Alert with description and action buttons">
      <Alert>
        <AlertDescription>
          Update your password and enable 2FA.
        </AlertDescription>
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
