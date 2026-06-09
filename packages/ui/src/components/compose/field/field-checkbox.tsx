"use client";

import { Checkbox } from "../../ui-shadcn/checkbox";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
} from "../../ui-shadcn/field";
import { ComposePatternCard } from "../compose.pattern-shell";

export function FieldCheckboxPattern() {
  return (
    <ComposePatternCard
      title="Checkbox"
      description="Horizontal field composition for binary settings."
    >
      <div className="max-w-md rounded-lg border bg-background p-4">
        <Field orientation="horizontal">
          <Checkbox id="field-checkbox-notify" defaultChecked />
          <FieldContent>
            <FieldLabel htmlFor="field-checkbox-notify">
              Email me when deployment health changes
            </FieldLabel>
            <FieldDescription>
              Critical incidents and recoveries are always included.
            </FieldDescription>
          </FieldContent>
        </Field>
      </div>
    </ComposePatternCard>
  );
}
