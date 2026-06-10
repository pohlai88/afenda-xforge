"use client";

import { ChevronDown, LayoutGrid, Shield, Sparkles } from "lucide-react";

import { Button } from "../../ui-shadcn/button";
import {
  CollapsibleContent,
  Collapsible as CollapsibleRoot,
  CollapsibleTrigger,
} from "../../ui-shadcn/collapsible";
import { Separator } from "../../ui-shadcn/separator";
import { CollapsiblePatternCard, CollapsibleStage } from "./collapsible.shared";

const menuSections = [
  {
    title: "Workspace",
    items: ["Overview", "Tasks", "Reports"],
  },
  {
    title: "Admin",
    items: ["Permissions", "Policies", "Integrations"],
  },
] as const;

export function CollapsibleMultiLevelMenu() {
  return (
    <CollapsiblePatternCard
      title="Multi-level collapsible menu"
      description="A stacked navigation layout with nested sections and deeper drill-downs."
    >
      <CollapsibleStage className="items-start">
        <div className="w-full max-w-md rounded-xl border bg-background shadow-sm">
          <div className="flex items-center justify-between gap-3 border-b px-4 py-3">
            <div className="flex items-center gap-2">
              <LayoutGrid className="size-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Navigation menu</p>
                <p className="text-sm text-muted-foreground">
                  Two levels of disclosure with distinct sections.
                </p>
              </div>
            </div>
            <Button aria-label="Open navigation menu" variant="ghost" size="icon-sm">
              <Sparkles className="size-4" />
            </Button>
          </div>
          <div className="p-2">
            {menuSections.map((section, index) => (
              <CollapsibleRoot
                key={section.title}
                defaultOpen={index === 0}
                className="rounded-lg border"
              >
                <div className="flex items-center justify-between gap-3 px-3 py-2">
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium">{section.title}</p>
                    <p className="text-xs text-muted-foreground">
                      Expand to inspect nested destinations.
                    </p>
                  </div>
                  <CollapsibleTrigger asChild>
                    <Button
                      aria-label={`Toggle ${section.title} section`}
                      variant="ghost"
                      size="icon-sm"
                      className="group"
                    >
                      <ChevronDown className="size-4 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                    </Button>
                  </CollapsibleTrigger>
                </div>
                <CollapsibleContent className="px-3 pb-3">
                  <Separator className="mb-3" />
                  <div className="grid gap-2">
                    {section.items.map((item, itemIndex) => (
                      <CollapsibleRoot
                        key={item}
                        defaultOpen={index === 1 && itemIndex === 0}
                        className="rounded-md bg-muted/30"
                      >
                        <div className="flex items-center justify-between gap-3 px-3 py-2">
                          <p className="text-sm">{item}</p>
                          <CollapsibleTrigger asChild>
                            <Button
                              aria-label={`Toggle ${item} submenu`}
                              variant="ghost"
                              size="icon-sm"
                              className="group"
                            >
                              <ChevronDown className="size-4 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                            </Button>
                          </CollapsibleTrigger>
                        </div>
                        <CollapsibleContent className="px-3 pb-3 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Shield className="size-4" />
                            <span>
                              Permissions and shortcuts for {item.toLowerCase()}
                              .
                            </span>
                          </div>
                        </CollapsibleContent>
                      </CollapsibleRoot>
                    ))}
                  </div>
                </CollapsibleContent>
              </CollapsibleRoot>
            ))}
          </div>
        </div>
      </CollapsibleStage>
    </CollapsiblePatternCard>
  );
}
