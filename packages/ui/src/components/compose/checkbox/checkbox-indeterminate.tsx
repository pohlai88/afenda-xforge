"use client";

import { Checkbox } from "../../ui-shadcn/checkbox";
import { Label } from "../../ui-shadcn/label";
import { CheckboxPatternCard } from "./checkbox.shared";

export function CheckboxIndeterminate() {
  return (
    <CheckboxPatternCard
      description="A parent checkbox reflects a partially selected group."
      title="Indeterminate checkbox"
    >
      <div className="grid gap-3">
        <div className="flex items-center gap-3">
          <Checkbox checked="indeterminate" id="checkbox-indeterminate" />
          <Label htmlFor="checkbox-indeterminate">
            Select all notifications
          </Label>
        </div>
        <div className="grid gap-2 pl-7 text-sm text-muted-foreground">
          <span>Email notifications</span>
          <span>SMS notifications</span>
          <span>Push notifications</span>
        </div>
      </div>
    </CheckboxPatternCard>
  );
}
