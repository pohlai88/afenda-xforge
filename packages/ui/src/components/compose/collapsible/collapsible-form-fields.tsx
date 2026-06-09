"use client";

import { ChevronDown } from "lucide-react";

import { Button } from "../../ui-shadcn/button";
import {
  CollapsibleContent,
  Collapsible as CollapsibleRoot,
  CollapsibleTrigger,
} from "../../ui-shadcn/collapsible";
import { Input } from "../../ui-shadcn/input";
import { Label } from "../../ui-shadcn/label";
import { CollapsiblePatternCard, CollapsibleStage } from "./collapsible.shared";

export function CollapsibleFormFields() {
  return (
    <CollapsiblePatternCard
      title="Collapsible form fields"
      description="A compact settings form that only expands when the details matter."
    >
      <CollapsibleStage>
        <CollapsibleRoot className="w-full max-w-md rounded-xl border bg-background shadow-sm">
          <div className="flex items-center justify-between gap-3 border-b px-4 py-3">
            <div>
              <p className="text-sm font-medium">Delivery address</p>
              <p className="text-sm text-muted-foreground">
                Expand to edit shipping details.
              </p>
            </div>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="icon-sm" className="group">
                <ChevronDown className="size-4 transition-transform duration-200 group-data-[state=open]:rotate-180" />
              </Button>
            </CollapsibleTrigger>
          </div>
          <CollapsibleContent className="grid gap-4 px-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="full-name">Full name</Label>
              <Input id="full-name" defaultValue="Ava Johnson" />
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="city">City</Label>
                <Input id="city" defaultValue="Bangkok" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="postal-code">Postal code</Label>
                <Input id="postal-code" defaultValue="10110" />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="address-line-1">Address line 1</Label>
              <Input id="address-line-1" defaultValue="245 Sukhumvit Road" />
            </div>
          </CollapsibleContent>
        </CollapsibleRoot>
      </CollapsibleStage>
    </CollapsiblePatternCard>
  );
}
