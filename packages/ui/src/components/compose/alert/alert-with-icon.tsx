"use client";

import { ShieldCheck } from "lucide-react";
import {
  Alert,
  AlertDescription,
  AlertPatternCard,
  AlertTitle,
} from "./alert.shared";

export function AlertWithIcon() {
  return (
    <AlertPatternCard title="Alert with icon">
      <Alert>
        <ShieldCheck />
        <AlertTitle>Security Update</AlertTitle>
        <AlertDescription>
          Update your password and enable 2FA.
        </AlertDescription>
      </Alert>
    </AlertPatternCard>
  );
}
