"use client";

import { Checkbox } from "../../ui-shadcn/checkbox";
import { Label } from "../../ui-shadcn/label";
import { CheckboxPatternCard } from "./checkbox.shared";

export function CheckboxInvalid() {
  return (
    <CheckboxPatternCard
      description="The checkbox uses the invalid state to surface a form error."
      title="Invalid checkbox"
    >
      <div className="grid gap-2">
        <div className="flex items-center gap-3">
          <Checkbox
            aria-describedby="checkbox-invalid-error"
            aria-invalid
            id="checkbox-invalid"
          />
          <Label htmlFor="checkbox-invalid">
            I agree to the privacy policy
          </Label>
        </div>
        <p
          className="text-sm text-destructive"
          id="checkbox-invalid-error"
          role="alert"
        >
          You must accept the privacy policy before continuing.
        </p>
      </div>
    </CheckboxPatternCard>
  );
}
