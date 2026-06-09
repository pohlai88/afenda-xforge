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

function DemoField({
  label,
  className,
}: {
  label: string;
  className?: string;
}) {
  const [value, setValue] = React.useState<number | null>(12);

  return (
    <NumberField value={value} onValueChange={setValue} className={className}>
      <NumberFieldScrubArea aria-label={label}>{label}</NumberFieldScrubArea>
      <NumberFieldGroup>
        <NumberFieldDecrement />
        <NumberFieldInput />
        <NumberFieldIncrement />
      </NumberFieldGroup>
    </NumberField>
  );
}

export function NumberFieldSize() {
  return (
    <NumberFieldPatternCard
      title="Size"
      description="Compare compact and roomy densities for the same control."
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <DemoField label="Small" className="max-w-xs" />
        <DemoField label="Large" className="max-w-sm" />
      </div>
    </NumberFieldPatternCard>
  );
}
