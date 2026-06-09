import type * as React from "react";

import { PhoneInputBasic } from "./phone-input-basic";
import { PhoneInputSize } from "./phone-input-size";
import { PhoneInputValidation } from "./phone-input-validation";

export type PhoneInputPatternSpec = {
  name: string;
  title: string;
  description: string;
  component: React.ComponentType;
};

export const phoneInputPatternCatalog = [
  {
    name: "basic",
    title: "Phone Input",
    description: "A phone number field with a country selector and validation.",
    component: PhoneInputBasic,
  },
  {
    name: "size",
    title: "Size",
    description: "Shows the available density and width variants.",
    component: PhoneInputSize,
  },
  {
    name: "validation",
    title: "Validation",
    description: "Highlights invalid values and acceptable formatting.",
    component: PhoneInputValidation,
  },
] as const satisfies readonly PhoneInputPatternSpec[];

export type PhoneInputPatternName =
  (typeof phoneInputPatternCatalog)[number]["name"];

export const phoneInputPatternCount = phoneInputPatternCatalog.length;
export const phoneInputPatternNames = phoneInputPatternCatalog.map(
  (pattern) => pattern.name,
) as PhoneInputPatternName[];
