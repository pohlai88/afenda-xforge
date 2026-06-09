"use client";

import { Badge } from "../../ui-shadcn/badge";
import {
  Alert,
  AlertDescription,
  AlertPatternCard,
  AlertTitle,
} from "./alert.shared";

export function StatusBadgeAlert() {
  return (
    <AlertPatternCard title="Status badge alert">
      <Alert variant="success">
        <Badge variant="secondary">Ready</Badge>
        <AlertTitle>Deployment complete</AlertTitle>
        <AlertDescription>
          The latest release has finished processing and is now live.
        </AlertDescription>
      </Alert>
    </AlertPatternCard>
  );
}
