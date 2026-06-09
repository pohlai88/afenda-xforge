"use client";

import {
  Alert,
  AlertDescription,
  AlertPatternCard,
  AlertTitle,
} from "./alert.shared";

export function AlertWithExtendedMessage() {
  return (
    <AlertPatternCard title="Alert with extended message">
      <Alert>
        <AlertTitle>Payment Failed</AlertTitle>
        <AlertDescription>
          Please check your payment details:
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>Card number and expiry</li>
            <li>Billing address</li>
            <li>Available funds</li>
          </ul>
        </AlertDescription>
      </Alert>
    </AlertPatternCard>
  );
}
