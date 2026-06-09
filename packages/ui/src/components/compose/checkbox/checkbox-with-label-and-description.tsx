"use client";

import { CheckboxOption, CheckboxPatternCard } from "./checkbox.shared";

export function CheckboxWithLabelAndDescription() {
  return (
    <CheckboxPatternCard title="Checkbox with label and description">
      <CheckboxOption
        description="Send a summary every Friday with the week's important updates."
        id="checkbox-with-label-and-description"
        title="Weekly digest"
      />
    </CheckboxPatternCard>
  );
}
