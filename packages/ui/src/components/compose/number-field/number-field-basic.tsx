"use client";

import * as React from "react";

import {
  NumberField,
  NumberFieldDecrement,
  NumberFieldGroup,
  NumberFieldIncrement,
  NumberFieldInput,
  NumberFieldPatternCard,
  NumberFieldScrubArea,
} from "./number-field.shared";

export function NumberFieldBasic() {
  const [value, setValue] = React.useState<number | null>(0);

  return (
    <NumberFieldPatternCard
      title="Number Field"
      description="A simple numeric field with a scrub area and increment controls."
    >
      <NumberField value={value} onValueChange={setValue}>
        <NumberFieldScrubArea aria-label="Quantity">
          Quantity
        </NumberFieldScrubArea>
        <NumberFieldGroup>
          <NumberFieldDecrement />
          <NumberFieldInput />
          <NumberFieldIncrement />
        </NumberFieldGroup>
      </NumberField>
    </NumberFieldPatternCard>
  );
}
