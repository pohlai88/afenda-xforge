"use client";

import { Checkbox } from "../../ui-shadcn/checkbox";
import { Label } from "../../ui-shadcn/label";
import { CheckboxFrame, CheckboxPatternCard } from "./checkbox.shared";

export function CheckboxCustomPositioned() {
  return (
    <CheckboxPatternCard
      description="The checkbox is pinned beside the heading instead of preceding the row."
      title="Custom positioned checkbox"
    >
      <CheckboxFrame className="relative min-h-28 overflow-hidden">
        <div className="space-y-2 pr-12">
          <h3 className="text-sm font-semibold">Marketing newsletter</h3>
          <p className="text-sm text-muted-foreground">
            Receive monthly product stories and feature highlights.
          </p>
        </div>
        <div className="absolute top-4 right-4">
          <Checkbox id="checkbox-custom-positioned" />
        </div>
        <Label
          htmlFor="checkbox-custom-positioned"
          className="absolute inset-x-4 bottom-4 text-sm text-muted-foreground"
        >
          Optional subscription
        </Label>
      </CheckboxFrame>
    </CheckboxPatternCard>
  );
}
