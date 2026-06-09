"use client";

import { ScrollText } from "lucide-react";

import { Button } from "../../ui-shadcn/button";
import { ScrollArea } from "../../ui-shadcn/scroll-area";
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

export function ScrollableContentDialog() {
  return (
    <AlertDialogPatternCard title="Scrollable content dialog">
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="outline">
            <ScrollText />
            Read policy
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Review policy details</AlertDialogTitle>
            <AlertDialogDescription>
              The content below is scrollable when the terms are long.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <ScrollArea className="h-36 rounded-md border p-3">
            <p className="text-sm text-muted-foreground">
              These are the policy details. They are intentionally long to
              demonstrate the scrollable body pattern inside an alert dialog.
            </p>
          </ScrollArea>
          <AlertDialogFooter>
            <AlertDialogCancel>Close</AlertDialogCancel>
            <AlertDialogAction>Accept</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AlertDialogPatternCard>
  );
}
