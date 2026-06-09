"use client";

import { ChevronDown, Ellipsis, Plus } from "lucide-react";

import { Badge } from "../../ui-shadcn/badge";
import { Button } from "../../ui-shadcn/button";
import {
  CollapsibleContent,
  Collapsible as CollapsibleRoot,
  CollapsibleTrigger,
} from "../../ui-shadcn/collapsible";
import { Separator } from "../../ui-shadcn/separator";
import { CollapsiblePatternCard, CollapsibleStage } from "./collapsible.shared";

const listItems = [
  {
    title: "Plan launch checklist",
    meta: "6 tasks",
    description: "A release checklist with nested follow-up items.",
  },
  {
    title: "Design review",
    meta: "3 comments",
    description: "Inline feedback and shared action items.",
  },
  {
    title: "QA handoff",
    meta: "2 blockers",
    description: "Verification notes that can expand independently.",
  },
] as const;

export function NestedCollapsibleListWithActions() {
  return (
    <CollapsiblePatternCard
      title="Nested collapsible list with actions"
      description="Each row can open independently while keeping actions aligned to the right."
    >
      <CollapsibleStage className="items-start">
        <div className="w-full max-w-md rounded-xl border bg-background shadow-sm">
          <div className="flex items-center justify-between gap-3 border-b px-4 py-3">
            <div>
              <p className="text-sm font-medium">Workstream items</p>
              <p className="text-sm text-muted-foreground">
                Expand rows to inspect the nested actions.
              </p>
            </div>
            <Button size="sm">
              <Plus className="size-4" />
              Add item
            </Button>
          </div>
          <div className="divide-y">
            {listItems.map((item) => (
              <CollapsibleRoot key={item.title}>
                <div className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium">{item.title}</p>
                        <Badge variant="outline">{item.meta}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {item.description}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon-sm">
                        <Ellipsis className="size-4" />
                      </Button>
                      <CollapsibleTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="group"
                        >
                          <ChevronDown className="size-4 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                        </Button>
                      </CollapsibleTrigger>
                    </div>
                  </div>
                  <CollapsibleContent className="pt-4">
                    <div className="rounded-lg border bg-muted/30 p-3 text-sm text-muted-foreground">
                      <p>
                        Nested notes, blockers, and context for{" "}
                        <span className="font-medium text-foreground">
                          {item.title.toLowerCase()}
                        </span>
                        .
                      </p>
                      <Separator className="my-3" />
                      <div className="flex flex-wrap gap-2">
                        <Button variant="ghost" size="sm">
                          Review
                        </Button>
                        <Button variant="ghost" size="sm">
                          Share
                        </Button>
                        <Button variant="ghost" size="sm">
                          Archive
                        </Button>
                      </div>
                    </div>
                  </CollapsibleContent>
                </div>
              </CollapsibleRoot>
            ))}
          </div>
        </div>
      </CollapsibleStage>
    </CollapsiblePatternCard>
  );
}
