"use client";

import { Rocket } from "lucide-react";

import { Button } from "../../ui-shadcn/button";
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

export function OnboardingDialog() {
  return (
    <AlertDialogPatternCard title="Onboarding dialog">
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button>
            <Rocket />
            Start onboarding
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Welcome to the setup flow</AlertDialogTitle>
            <AlertDialogDescription>
              Review the guided steps before starting the onboarding sequence.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Later</AlertDialogCancel>
            <AlertDialogAction>Start</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AlertDialogPatternCard>
  );
}
