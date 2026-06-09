"use client";

import { Button } from "../../ui-shadcn/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../../ui-shadcn/sheet";
import { ComposePatternCard } from "../compose.pattern-shell";

export function SheetNoCloseButton() {
  return (
    <ComposePatternCard
      title="No Close Button"
      description="An explicit sheet flow that relies on footer actions instead of a top-right dismiss control."
    >
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline">Open review</Button>
        </SheetTrigger>
        <SheetContent showCloseButton={false}>
          <SheetHeader>
            <SheetTitle>Review queued changes</SheetTitle>
            <SheetDescription>
              Require an explicit decision before leaving this panel.
            </SheetDescription>
          </SheetHeader>
          <div className="rounded-md border bg-muted/20 p-4 text-sm text-muted-foreground">
            This pattern suits guarded review steps or commit-like actions.
          </div>
          <SheetFooter>
            <SheetClose asChild>
              <Button variant="outline">Dismiss</Button>
            </SheetClose>
            <Button>Continue</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </ComposePatternCard>
  );
}
