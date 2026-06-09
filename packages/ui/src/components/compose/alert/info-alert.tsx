"use client";

import { Info } from "lucide-react";
import {
  Alert,
  AlertDescription,
  AlertPatternCard,
  AlertTitle,
} from "./alert.shared";

export function InfoAlert() {
  return (
    <AlertPatternCard title="Info alert">
      <Alert variant="info">
        <Info />
        <AlertTitle>Info! Something important</AlertTitle>
        <AlertDescription>
          This is an important message. Please read it carefully.
        </AlertDescription>
      </Alert>
    </AlertPatternCard>
  );
}
