"use client";

import { KeyRound } from "lucide-react";

import { Button } from "../../ui-shadcn/button";
import { Input } from "../../ui-shadcn/input";
import { Label } from "../../ui-shadcn/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogPatternCard,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./alert-dialog.shared";

export function FormEntryDialog() {
  return (
    <AlertDialogPatternCard title="Form entry dialog">
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="outline">
            <KeyRound />
            Enter code
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Enter verification code</AlertDialogTitle>
            <AlertDialogDescription>
              Use the code from your authenticator app to continue.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="grid gap-2">
            <Label htmlFor="verification-code">Verification code</Label>
            <Input id="verification-code" placeholder="123456" />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction>Verify</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AlertDialogPatternCard>
  );
}
