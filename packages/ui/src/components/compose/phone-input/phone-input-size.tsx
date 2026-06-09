"use client";

import * as React from "react";

import { PhoneInput, PhoneInputPatternCard } from "./phone-input.shared";

function Demo({ variant }: { variant: "sm" | "default" | "lg" }) {
  const [value, setValue] = React.useState<string | undefined>(undefined);

  return (
    <PhoneInput
      variant={variant}
      value={value}
      onChange={setValue}
      defaultCountry="US"
      placeholder="(213) 373-4253"
    />
  );
}

export function PhoneInputSize() {
  return (
    <PhoneInputPatternCard
      title="Size"
      description="Compare compact and spacious field densities."
    >
      <div className="grid gap-4">
        <Demo variant="sm" />
        <Demo variant="default" />
        <Demo variant="lg" />
      </div>
    </PhoneInputPatternCard>
  );
}
