"use client";

import { Checkbox } from "../../ui-shadcn/checkbox";
import { Label } from "../../ui-shadcn/label";
import { CheckboxFrame, CheckboxPatternCard } from "./checkbox.shared";

export function CheckboxNestedGroup() {
  return (
    <CheckboxPatternCard
      description="A parent checkbox controls nested child options."
      title="Nested checkbox group"
    >
      <CheckboxFrame>
        <div className="grid gap-4">
          <div className="flex items-center gap-3">
            <Checkbox checked="indeterminate" id="checkbox-nested-parent" />
            <Label htmlFor="checkbox-nested-parent" className="font-medium">
              Workspace notifications
            </Label>
          </div>
          <div className="grid gap-3 border-s border-border pl-6">
            <div className="flex items-center gap-3">
              <Checkbox defaultChecked id="checkbox-nested-child-1" />
              <Label htmlFor="checkbox-nested-child-1">Mentions</Label>
            </div>
            <div className="flex items-center gap-3">
              <Checkbox id="checkbox-nested-child-2" />
              <Label htmlFor="checkbox-nested-child-2">Thread replies</Label>
            </div>
            <div className="flex items-center gap-3">
              <Checkbox defaultChecked id="checkbox-nested-child-3" />
              <Label htmlFor="checkbox-nested-child-3">Project changes</Label>
            </div>
          </div>
        </div>
      </CheckboxFrame>
    </CheckboxPatternCard>
  );
}
