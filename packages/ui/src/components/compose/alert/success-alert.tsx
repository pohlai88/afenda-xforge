"use client";

import { BadgeCheck } from "lucide-react";
import {
  Alert,
  AlertDescription,
  AlertPatternCard,
  AlertTitle,
} from "./alert.shared";

export function SuccessAlert() {
  return (
    <AlertPatternCard title="Success alert">
      <Alert variant="success">
        <BadgeCheck />
        <AlertTitle>Success! All good</AlertTitle>
        <AlertDescription>
          Everything is working as expected. You can continue with your task.
        </AlertDescription>
      </Alert>
    </AlertPatternCard>
  );
}
