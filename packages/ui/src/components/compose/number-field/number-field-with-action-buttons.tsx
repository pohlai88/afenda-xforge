"use client";

import * as React from "react";

import { Button } from "../../ui-shadcn/button";
import {
  NumberField,
  NumberFieldDecrement,
  NumberFieldGroup,
  NumberFieldIncrement,
  NumberFieldInput,
  NumberFieldPatternCard,
  NumberFieldScrubArea,
  RotateCcw,
} from "./number-field.shared";

export function NumberFieldWithActionButtons() {
  const [value, setValue] = React.useState<number | null>(24);

  return (
    <NumberFieldPatternCard
      title="With Action Buttons"
      description="Combine stepper controls with a reset action in the same row."
    >
      <div className="flex flex-wrap items-end gap-3">
        <NumberField value={value} onValueChange={setValue}>
          <NumberFieldScrubArea aria-label="Amount">
            Amount
          </NumberFieldScrubArea>
          <NumberFieldGroup>
            <NumberFieldDecrement />
            <NumberFieldInput />
            <NumberFieldIncrement />
          </NumberFieldGroup>
        </NumberField>
        <Button variant="outline" size="sm" onClick={() => setValue(24)}>
          <RotateCcw data-icon="inline-start" />
          Reset
        </Button>
      </div>
    </NumberFieldPatternCard>
  );
}
