"use client";

import { ChevronDown, Sparkles } from "lucide-react";

import { Button } from "../../ui-shadcn/button";
import {
  CollapsibleContent,
  Collapsible as CollapsibleRoot,
  CollapsibleTrigger,
} from "../../ui-shadcn/collapsible";
import { CollapsiblePatternCard, CollapsibleStage } from "./collapsible.shared";

export function CollapsibleAnimatedCard() {
  return (
    <CollapsiblePatternCard
      title="Collapsible animated card"
      description="A richer card surface with a prominent trigger and a visual accent."
    >
      <CollapsibleStage>
        <CollapsibleRoot defaultOpen className="w-full max-w-md">
          <div className="overflow-hidden rounded-2xl border bg-background shadow-sm">
            <div className="bg-gradient-to-r from-primary/10 via-transparent to-primary/5 px-5 py-4">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-2 rounded-full border bg-background px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                    <Sparkles className="size-3.5 text-primary" />
                    Highlighted summary
                  </div>
                  <p className="text-base font-semibold">
                    Conversion rate: 29.9%
                  </p>
                  <p className="text-sm text-muted-foreground">
                    The surrounding card keeps the title visible while the body
                    expands on demand.
                  </p>
                </div>
                <CollapsibleTrigger asChild>
                  <Button
                    aria-label="Toggle conversion summary"
                    variant="ghost"
                    size="icon-sm"
                    className="group"
                  >
                    <ChevronDown className="size-4 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                  </Button>
                </CollapsibleTrigger>
              </div>
            </div>
            <CollapsibleContent className="grid gap-3 px-5 py-4 text-sm text-muted-foreground">
              <p>
                A subtle gradient background and rotating chevron add motion
                without changing the disclosure model.
              </p>
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-lg border bg-muted/40 p-3">
                  <p className="text-xs text-muted-foreground">Visitors</p>
                  <p className="text-sm font-medium">12.4k</p>
                </div>
                <div className="rounded-lg border bg-muted/40 p-3">
                  <p className="text-xs text-muted-foreground">Leads</p>
                  <p className="text-sm font-medium">3.2k</p>
                </div>
                <div className="rounded-lg border bg-muted/40 p-3">
                  <p className="text-xs text-muted-foreground">Wins</p>
                  <p className="text-sm font-medium">429</p>
                </div>
              </div>
            </CollapsibleContent>
          </div>
        </CollapsibleRoot>
      </CollapsibleStage>
    </CollapsiblePatternCard>
  );
}
