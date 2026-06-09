"use client";

import { Image as ImageIcon } from "lucide-react";

import { Button } from "../../ui-shadcn/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogPatternCard,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./alert-dialog.shared";

export function MediaPreviewDialog() {
  return (
    <AlertDialogPatternCard title="Media preview dialog">
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="outline">
            <ImageIcon />
            Preview media
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogMedia>
              <ImageIcon />
            </AlertDialogMedia>
            <AlertDialogTitle>Replace the preview image?</AlertDialogTitle>
            <AlertDialogDescription>
              The existing preview will be overwritten by the new media asset.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction>Replace</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AlertDialogPatternCard>
  );
}
