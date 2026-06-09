"use client";

import * as React from "react";

import type { Country } from "./phone-input.shared";
import { PhoneInput, PhoneInputPatternCard } from "./phone-input.shared";

export function PhoneInputBasic() {
  const [value, setValue] = React.useState<string | undefined>(undefined);
  const [country, setCountry] = React.useState<Country | undefined>("US");

  return (
    <PhoneInputPatternCard
      title="Phone Input"
      description="A phone number input with country selection and validation."
    >
      <PhoneInput
        value={value}
        onChange={setValue}
        defaultCountry={country}
        onCountryChange={setCountry}
        placeholder="Enter phone number"
      />
    </PhoneInputPatternCard>
  );
}
