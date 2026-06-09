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

export function SheetTop() {
  return (
    <ComposePatternCard
      title="Top"
      description="A compact top sheet for transient summaries and announcements."
    >
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline">Open summary</Button>
        </SheetTrigger>
        <SheetContent side="top" className="max-h-[50vh]">
          <SheetHeader>
            <SheetTitle>Deployment summary</SheetTitle>
            <SheetDescription>
              Review the latest environment changes before promotion.
            </SheetDescription>
          </SheetHeader>
          <div className="grid gap-3 px-4 pb-4 text-sm">
            <div className="rounded-md border p-3">2 services updated</div>
            <div className="rounded-md border p-3">1 migration pending</div>
          </div>
        </SheetContent>
      </Sheet>
    </ComposePatternCard>
  );
}
