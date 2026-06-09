"use client";

import { Checkbox } from "../../ui-shadcn/checkbox";
import { Label } from "../../ui-shadcn/label";
import { CheckboxFrame, CheckboxPatternCard } from "./checkbox.shared";

export function CheckboxCustomPositioned2() {
  return (
    <CheckboxPatternCard
      description="A compact card where the checkbox anchors the action area."
      title="Custom positioned checkbox"
    >
      <CheckboxFrame className="relative flex items-start gap-4">
        <div className="flex-1 space-y-2">
          <h3 className="text-sm font-semibold">Share anonymized usage data</h3>
          <p className="text-sm text-muted-foreground">
            Helps prioritize product improvements and troubleshooting.
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <Checkbox id="checkbox-custom-positioned-2" defaultChecked />
          <Label
            htmlFor="checkbox-custom-positioned-2"
            className="text-xs text-muted-foreground"
          >
            Enabled
          </Label>
        </div>
      </CheckboxFrame>
    </CheckboxPatternCard>
  );
}
