"use client";

import { Checkbox } from "../../ui-shadcn/checkbox";
import { Label } from "../../ui-shadcn/label";
import { CheckboxFrame, CheckboxPatternCard } from "./checkbox.shared";

export function CheckboxInlineHorizontalGroup() {
  return (
    <CheckboxPatternCard
      description="Checkboxes flow horizontally and wrap on smaller widths."
      title="Inline horizontal checkbox group"
    >
      <CheckboxFrame>
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2 rounded-full border border-border/70 px-3 py-2">
            <Checkbox id="checkbox-inline-1" />
            <Label htmlFor="checkbox-inline-1">Email</Label>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-border/70 px-3 py-2">
            <Checkbox defaultChecked id="checkbox-inline-2" />
            <Label htmlFor="checkbox-inline-2">SMS</Label>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-border/70 px-3 py-2">
            <Checkbox id="checkbox-inline-3" />
            <Label htmlFor="checkbox-inline-3">Push</Label>
          </div>
        </div>
      </CheckboxFrame>
    </CheckboxPatternCard>
  );
}
