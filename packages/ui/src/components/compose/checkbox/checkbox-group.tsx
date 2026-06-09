"use client";

import {
  CheckboxList,
  CheckboxOption,
  CheckboxPatternCard,
} from "./checkbox.shared";

export function CheckboxGroup() {
  return (
    <CheckboxPatternCard
      description="A plain list of checkbox options for a quick multi-select."
      title="Checkbox group"
    >
      <CheckboxList>
        <CheckboxOption id="checkbox-group-1" title="Daily summary emails" />
        <CheckboxOption id="checkbox-group-2" title="Product updates" />
        <CheckboxOption id="checkbox-group-3" title="Security alerts" />
      </CheckboxList>
    </CheckboxPatternCard>
  );
}
