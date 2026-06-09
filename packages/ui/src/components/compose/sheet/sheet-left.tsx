"use client";

import { Button } from "../../ui-shadcn/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../../ui-shadcn/sheet";
import { ComposePatternCard } from "../compose.pattern-shell";

export function SheetLeft() {
  return (
    <ComposePatternCard
      title="Left"
      description="A left-side sheet for navigation or supporting context."
    >
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline">Open navigator</Button>
        </SheetTrigger>
        <SheetContent side="left">
          <SheetHeader>
            <SheetTitle>Project navigator</SheetTitle>
            <SheetDescription>
              Browse pinned sections, collections, and saved views.
            </SheetDescription>
          </SheetHeader>
          <div className="space-y-3 px-4 text-sm">
            <div className="rounded-md border p-3">Pinned dashboards</div>
            <div className="rounded-md border p-3">Collections</div>
            <div className="rounded-md border p-3">Saved filters</div>
          </div>
        </SheetContent>
      </Sheet>
    </ComposePatternCard>
  );
}
