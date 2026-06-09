"use client";

import { ChevronDown, Frame } from "lucide-react";

import { Badge } from "../../ui-shadcn/badge";
import { Button } from "../../ui-shadcn/button";
import {
  CollapsibleContent,
  Collapsible as CollapsibleRoot,
  CollapsibleTrigger,
} from "../../ui-shadcn/collapsible";
import { CollapsiblePatternCard, CollapsibleStage } from "./collapsible.shared";

export function CollapsibleFrame() {
  return (
    <CollapsiblePatternCard
      title="Collapsible frame"
      description="A framed container with dashed boundaries and a restrained disclosure."
    >
      <CollapsibleStage>
        <CollapsibleRoot defaultOpen className="w-full max-w-md">
          <div className="rounded-2xl border border-dashed bg-background p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Frame className="size-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Review frame</p>
                  <p className="text-sm text-muted-foreground">
                    Content is wrapped in a framed shell.
                  </p>
                </div>
              </div>
              <Badge variant="secondary">Draft</Badge>
            </div>
            <div className="mt-4 rounded-xl border bg-muted/20 p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium">Notes and context</p>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="icon-sm" className="group">
                    <ChevronDown className="size-4 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                  </Button>
                </CollapsibleTrigger>
              </div>
              <CollapsibleContent className="pt-3 text-sm leading-6 text-muted-foreground">
                The dashed frame keeps the disclosure visually separated from
                the surrounding layout while still reading as one object.
              </CollapsibleContent>
            </div>
          </div>
        </CollapsibleRoot>
      </CollapsibleStage>
    </CollapsiblePatternCard>
  );
}
