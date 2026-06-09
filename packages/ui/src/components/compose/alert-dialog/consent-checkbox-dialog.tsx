"use client";

import { CheckSquare } from "lucide-react";

import { Button } from "../../ui-shadcn/button";
import { Checkbox } from "../../ui-shadcn/checkbox";
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

export function ConsentCheckboxDialog() {
  return (
    <AlertDialogPatternCard title="Consent checkbox dialog">
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="outline">
            <CheckSquare />
            Request consent
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Accept the terms?</AlertDialogTitle>
            <AlertDialogDescription>
              You must confirm the consent checkbox before proceeding.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex items-center gap-3 rounded-md border p-3">
            <Checkbox id="consent" />
            <label htmlFor="consent" className="text-sm">
              I agree to the terms and conditions.
            </label>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Back</AlertDialogCancel>
            <AlertDialogAction>Agree</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AlertDialogPatternCard>
  );
}
