"use client";

import * as React from "react";

import { Badge } from "../../ui-shadcn/badge";
import {
  isValidPhoneNumber,
  PhoneInput,
  PhoneInputPatternCard,
} from "./phone-input.shared";

export function PhoneInputValidation() {
  const [value, setValue] = React.useState<string | undefined>(undefined);
  const isValid = value ? isValidPhoneNumber(value) : false;

  return (
    <PhoneInputPatternCard
      title="Validation"
      description="Surface invalid numbers with immediate feedback."
    >
      <div className="grid gap-3">
        <PhoneInput
          value={value}
          onChange={setValue}
          defaultCountry="US"
          placeholder="Enter a valid phone number"
        />
        <div className="flex items-center gap-2">
          <Badge variant={isValid ? "secondary" : "destructive"}>
            {isValid ? "Valid" : "Invalid"}
          </Badge>
          <span className="text-sm text-muted-foreground">
            {value ? value : "Type a number to validate it."}
          </span>
        </div>
      </div>
    </PhoneInputPatternCard>
  );
}
