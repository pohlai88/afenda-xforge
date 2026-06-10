"use client";

import { ChevronDown } from "lucide-react";

import { Button } from "../../ui-shadcn/button";
import {
  CollapsibleContent,
  Collapsible as CollapsibleRoot,
  CollapsibleTrigger,
} from "../../ui-shadcn/collapsible";
import { CollapsiblePatternCard, CollapsibleStage } from "./collapsible.shared";

export function CollapsibleBasic() {
  return (
    <CollapsiblePatternCard
      title="Basic collapsible"
      description="A minimal disclosure pattern with a compact body and a single trigger."
    >
      <CollapsibleStage>
        <CollapsibleRoot defaultOpen className="w-full max-w-md">
          <div className="rounded-xl border bg-background p-4 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <p className="text-sm font-medium">Project notes</p>
                <p className="text-sm text-muted-foreground">
                  Last updated 12 minutes ago
                </p>
              </div>
              <CollapsibleTrigger asChild>
                <Button
                  aria-label="Toggle project notes"
                  variant="ghost"
                  size="icon-sm"
                  className="group"
                >
                  <ChevronDown className="size-4 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                </Button>
              </CollapsibleTrigger>
            </div>
            <CollapsibleContent className="pt-4 text-sm leading-6 text-muted-foreground">
              The latest implementation notes are visible by default, and the
              body can be collapsed once the summary has been reviewed.
            </CollapsibleContent>
          </div>
        </CollapsibleRoot>
      </CollapsibleStage>
    </CollapsiblePatternCard>
  );
}
