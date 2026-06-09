"use client";

import { Checkbox } from "../../ui-shadcn/checkbox";
import { Label } from "../../ui-shadcn/label";
import { CheckboxPatternCard } from "./checkbox.shared";

export function CheckboxBasicWithLabel() {
  return (
    <CheckboxPatternCard title="Basic checkbox with label">
      <div className="flex items-center gap-3">
        <Checkbox id="checkbox-basic-with-label" />
        <Label htmlFor="checkbox-basic-with-label">
          Accept terms and conditions
        </Label>
      </div>
    </CheckboxPatternCard>
  );
}
