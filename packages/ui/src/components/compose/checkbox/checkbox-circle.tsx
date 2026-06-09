"use client";

import {
  CheckboxList,
  CheckboxOption,
  CheckboxPatternCard,
} from "./checkbox.shared";

export function CheckboxCircle() {
  return (
    <CheckboxPatternCard
      description="A circular checkbox variant for softer visual emphasis."
      title="Circle checkbox"
    >
      <CheckboxList>
        <CheckboxOption
          checkboxClassName="rounded-full"
          id="checkbox-circle-1"
          title="Enable beta access"
        />
        <CheckboxOption
          checkboxClassName="rounded-full"
          id="checkbox-circle-2"
          title="Keep me signed in"
        />
      </CheckboxList>
    </CheckboxPatternCard>
  );
}
