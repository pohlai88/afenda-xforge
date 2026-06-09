"use client";

import { CreditCard } from "lucide-react";
import {
  Alert,
  AlertDescription,
  AlertPatternCard,
  AlertTitle,
} from "./alert.shared";

export function PaymentFailedAlert() {
  return (
    <AlertPatternCard title="Payment failed alert">
      <Alert variant="destructive">
        <CreditCard />
        <AlertTitle>Payment Failed</AlertTitle>
        <AlertDescription>
          Please check your payment details before retrying the charge.
        </AlertDescription>
      </Alert>
    </AlertPatternCard>
  );
}
