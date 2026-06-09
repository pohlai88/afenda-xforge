import type * as React from "react";

import { NumberFieldBasic } from "./number-field-basic";
import { NumberFieldExtendedMessage } from "./number-field-extended-message";
import { NumberFieldSize } from "./number-field-size";
import { NumberFieldWithActionButtons } from "./number-field-with-action-buttons";

export type NumberFieldPatternSpec = {
  name: string;
  title: string;
  description: string;
  component: React.ComponentType;
};

export const numberFieldPatternCatalog = [
  {
    name: "basic",
    title: "Number Field",
    description: "A numeric input with a scrub area and stepper controls.",
    component: NumberFieldBasic,
  },
  {
    name: "size",
    title: "Size",
    description: "Shows the compact and spacious field densities.",
    component: NumberFieldSize,
  },
  {
    name: "with-action-buttons",
    title: "With Action Buttons",
    description: "Adds a reset action alongside the stepper controls.",
    component: NumberFieldWithActionButtons,
  },
  {
    name: "with-extended-message",
    title: "With Extended Message",
    description: "Supports helper text and contextual guidance.",
    component: NumberFieldExtendedMessage,
  },
] as const satisfies readonly NumberFieldPatternSpec[];

export type NumberFieldPatternName =
  (typeof numberFieldPatternCatalog)[number]["name"];

export const numberFieldPatternCount = numberFieldPatternCatalog.length;
export const numberFieldPatternNames = numberFieldPatternCatalog.map(
  (pattern) => pattern.name,
) as NumberFieldPatternName[];
