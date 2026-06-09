"use client";

import { AlertCircle } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "../../ui-shadcn/avatar";
import {
  Alert,
  AlertDescription,
  AlertPatternCard,
  AlertTitle,
} from "./alert.shared";

export function AvatarAlert() {
  return (
    <AlertPatternCard title="Avatar alert">
      <Alert>
        <Avatar className="size-8">
          <AvatarImage src="https://github.com/shadcn.png" alt="User avatar" />
          <AvatarFallback>SC</AvatarFallback>
        </Avatar>
        <AlertCircle />
        <AlertTitle>Account activity requires review</AlertTitle>
        <AlertDescription>
          A recent sign-in was detected from a new device.
        </AlertDescription>
      </Alert>
    </AlertPatternCard>
  );
}
