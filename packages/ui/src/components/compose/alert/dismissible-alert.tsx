"use client";

import { X } from "lucide-react";
import { Button } from "../../ui-shadcn/button";
import {
  Alert,
  AlertAction,
  AlertDescription,
  AlertPatternCard,
  AlertTitle,
} from "./alert.shared";

export function DismissibleAlert() {
  return (
    <AlertPatternCard title="Dismissible alert">
      <Alert>
        <AlertTitle>Security Notice</AlertTitle>
        <AlertDescription>
          Review the policy update and dismiss when done.
        </AlertDescription>
        <AlertAction>
          <Button variant="ghost" size="sm">
            <X className="size-4" />
            Dismiss
          </Button>
        </AlertAction>
      </Alert>
    </AlertPatternCard>
  );
}
