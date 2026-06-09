"use client";

import { UserRound } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "../../ui-shadcn/avatar";
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

export function AvatarOwnerDialog() {
  return (
    <AlertDialogPatternCard title="Avatar owner dialog">
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="outline">
            <UserRound />
            Review owner
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <Avatar className="size-10">
              <AvatarImage
                src="https://github.com/shadcn.png"
                alt="Owner avatar"
              />
              <AvatarFallback>SC</AvatarFallback>
            </Avatar>
            <AlertDialogTitle>Account owner verification</AlertDialogTitle>
            <AlertDialogDescription>
              Confirm the person managing this account before making changes.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Not now</AlertDialogCancel>
            <AlertDialogAction>Confirm</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AlertDialogPatternCard>
  );
}
