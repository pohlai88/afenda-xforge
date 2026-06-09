"use client";

import { ClipboardList } from "lucide-react";
import {
  Alert,
  AlertDescription,
  AlertPatternCard,
  AlertTitle,
} from "./alert.shared";

export function BulletListAlert() {
  return (
    <AlertPatternCard title="Bullet list alert">
      <Alert variant="warning">
        <ClipboardList />
        <AlertTitle>Before you continue</AlertTitle>
        <AlertDescription>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>Confirm the account owner.</li>
            <li>Review the billing plan.</li>
            <li>Check the required access level.</li>
          </ul>
        </AlertDescription>
      </Alert>
    </AlertPatternCard>
  );
}
