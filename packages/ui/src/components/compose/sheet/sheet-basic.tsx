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

export function SheetBasic() {
  return (
    <ComposePatternCard
      title="Basic"
      description="A standard right-side sheet for secondary workflows."
    >
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline">Open sheet</Button>
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Edit workspace</SheetTitle>
            <SheetDescription>
              Adjust defaults without leaving the current surface.
            </SheetDescription>
          </SheetHeader>
          <div className="px-4 text-sm text-muted-foreground">
            Sheets are appropriate for non-destructive contextual workflows.
          </div>
          <SheetFooter>
            <SheetClose asChild>
              <Button variant="outline">Cancel</Button>
            </SheetClose>
            <Button>Save changes</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </ComposePatternCard>
  );
}
