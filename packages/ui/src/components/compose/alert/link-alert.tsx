"use client";

import { ExternalLink } from "lucide-react";
import { Button } from "../../ui-shadcn/button";
import {
  Alert,
  AlertAction,
  AlertDescription,
  AlertPatternCard,
  AlertTitle,
} from "./alert.shared";

export function LinkAlert() {
  return (
    <AlertPatternCard title="Link alert">
      <Alert variant="info">
        <ExternalLink />
        <AlertTitle>Documentation available</AlertTitle>
        <AlertDescription>
          Open the product guide for setup instructions and implementation
          notes.
        </AlertDescription>
        <AlertAction>
          <Button variant="outline" size="sm" asChild>
            <a
              href="https://reui.io/components/alert"
              target="_blank"
              rel="noreferrer"
            >
              View docs
            </a>
          </Button>
        </AlertAction>
      </Alert>
    </AlertPatternCard>
  );
}
