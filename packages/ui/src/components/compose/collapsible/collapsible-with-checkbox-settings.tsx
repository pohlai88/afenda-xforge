"use client";

import { ChevronDown } from "lucide-react";

import { Badge } from "../../ui-shadcn/badge";
import { Button } from "../../ui-shadcn/button";
import { Checkbox } from "../../ui-shadcn/checkbox";
import {
  CollapsibleContent,
  Collapsible as CollapsibleRoot,
  CollapsibleTrigger,
} from "../../ui-shadcn/collapsible";
import { CollapsiblePatternCard, CollapsibleStage } from "./collapsible.shared";

const checkboxSettings = [
  {
    id: "email-alerts",
    label: "Email alerts",
    description: "Send a digest after each important update.",
    checked: true,
  },
  {
    id: "mobile-push",
    label: "Mobile push",
    description: "Notify the active device immediately.",
    checked: false,
  },
  {
    id: "weekly-summary",
    label: "Weekly summary",
    description: "Bundle low priority changes into one review.",
    checked: true,
  },
] as const;

export function CollapsibleWithCheckboxSettings() {
  return (
    <CollapsiblePatternCard
      title="Collapsible with checkbox settings"
      description="A settings block with toggles, labels, and a short action row."
    >
      <CollapsibleStage className="items-start">
        <CollapsibleRoot className="w-full max-w-md rounded-xl border bg-background shadow-sm">
          <div className="flex items-center justify-between gap-3 border-b px-4 py-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium">Notification settings</p>
                <Badge variant="secondary" className="rounded-full">
                  3 options
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Adjust which events should expand into alerts.
              </p>
            </div>
            <CollapsibleTrigger asChild>
              <Button
                aria-label="Toggle notification settings"
                variant="ghost"
                size="icon-sm"
                className="group"
              >
                <ChevronDown className="size-4 transition-transform duration-200 group-data-[state=open]:rotate-180" />
              </Button>
            </CollapsibleTrigger>
          </div>
          <CollapsibleContent className="space-y-4 px-4 py-4">
            {checkboxSettings.map((setting) => (
              <label
                key={setting.id}
                htmlFor={setting.id}
                className="flex items-start gap-3 rounded-lg border p-3"
              >
                <Checkbox id={setting.id} defaultChecked={setting.checked} />
                <span className="space-y-1">
                  <span className="block text-sm font-medium">
                    {setting.label}
                  </span>
                  <span className="block text-sm text-muted-foreground">
                    {setting.description}
                  </span>
                </span>
              </label>
            ))}
            <div className="flex items-center justify-end gap-2">
              <Button variant="ghost" size="sm">
                Reset
              </Button>
              <Button size="sm">Save changes</Button>
            </div>
          </CollapsibleContent>
        </CollapsibleRoot>
      </CollapsibleStage>
    </CollapsiblePatternCard>
  );
}
