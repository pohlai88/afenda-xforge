"use client";

import { Checkbox } from "../../ui-shadcn/checkbox";
import { Label } from "../../ui-shadcn/label";
import { CheckboxPatternCard } from "./checkbox.shared";

export function CheckboxDisabled() {
  return (
    <CheckboxPatternCard title="Disabled checkbox">
      <div className="grid gap-3">
        <div className="flex items-center gap-3 opacity-60">
          <Checkbox checked id="checkbox-disabled-checked" disabled />
          <Label htmlFor="checkbox-disabled-checked">Sync enabled</Label>
        </div>
        <div className="flex items-center gap-3 opacity-60">
          <Checkbox id="checkbox-disabled-unchecked" disabled />
          <Label htmlFor="checkbox-disabled-unchecked">Analytics enabled</Label>
        </div>
      </div>
    </CheckboxPatternCard>
  );
}
