"use client";

import { ShieldCheck } from "lucide-react";
import { Button } from "../../ui-shadcn/button";
import {
  Alert,
  AlertAction,
  AlertDescription,
  AlertPatternCard,
  AlertTitle,
} from "./alert.shared";

export function SecurityUpdateAlert() {
  return (
    <AlertPatternCard title="Security update alert">
      <Alert>
        <ShieldCheck />
        <AlertTitle>Security Update</AlertTitle>
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
