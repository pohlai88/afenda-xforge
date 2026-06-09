"use client";

import * as React from "react";

import { Badge } from "../../ui-shadcn/badge";
import {
  NumberField,
  NumberFieldDecrement,
  NumberFieldGroup,
  NumberFieldIncrement,
  NumberFieldInput,
  NumberFieldPatternCard,
  NumberFieldScrubArea,
} from "./number-field.shared";

export function NumberFieldExtendedMessage() {
  const [value, setValue] = React.useState<number | null>(120);

  return (
    <NumberFieldPatternCard
      title="With Extended Message"
      description="Use helper text to explain units, limits, or related rules."
    >
      <div className="grid gap-3">
        <NumberField value={value} onValueChange={setValue} min={0} max={240}>
          <NumberFieldScrubArea aria-label="Duration">
            Duration
          </NumberFieldScrubArea>
          <NumberFieldGroup>
            <NumberFieldDecrement />
            <NumberFieldInput />
            <NumberFieldIncrement />
          </NumberFieldGroup>
        </NumberField>
        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <span>Recommended range:</span>
          <Badge variant="secondary">0 - 240 minutes</Badge>
          <span>Used for session length and timeout settings.</span>
        </div>
      </div>
    </NumberFieldPatternCard>
  );
}
