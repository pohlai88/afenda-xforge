"use client";

import { Badge } from "../../ui-shadcn/badge";
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

export function StatusBadgeDialog() {
  return (
    <AlertDialogPatternCard title="Status badge dialog">
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="outline">Open status</Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <Badge variant="secondary" className="w-fit">
              Ready
            </Badge>
            <AlertDialogTitle>Deployment status</AlertDialogTitle>
            <AlertDialogDescription>
              The deployment finished successfully and is ready for review.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Later</AlertDialogCancel>
            <AlertDialogAction>View</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AlertDialogPatternCard>
  );
}
