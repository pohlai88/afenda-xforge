import type * as React from "react";

import { DateSelectorBasic } from "./date-selector-basic";
import { DateSelectorWithDialog } from "./date-selector-with-dialog";
import { DateSelectorWithDropdownMenu } from "./date-selector-with-dropdown-menu";
import { DateSelectorWithPopover } from "./date-selector-with-popover";

export type DateSelectorPatternSpec = {
  name: string;
  title: string;
  description: string;
  component: React.ComponentType;
};

export const dateSelectorPatternCatalog = [
  {
    name: "basic",
    title: "Basic",
    description: "A compact inline selector with debug output.",
    component: DateSelectorBasic,
  },
  {
    name: "popover",
    title: "With Popover",
    description: "Opens the selector inside a popover panel.",
    component: DateSelectorWithPopover,
  },
  {
    name: "dialog",
    title: "With Dialog",
    description: "Opens the selector inside a dialog for focus.",
    component: DateSelectorWithDialog,
  },
  {
    name: "dropdown-menu",
    title: "With i18n Support",
    description: "Pairs a language menu with localized selector labels.",
    component: DateSelectorWithDropdownMenu,
  },
] as const satisfies readonly DateSelectorPatternSpec[];

export type DateSelectorPatternName =
  (typeof dateSelectorPatternCatalog)[number]["name"];

export const dateSelectorPatternCount = dateSelectorPatternCatalog.length;
export const dateSelectorPatternNames = dateSelectorPatternCatalog.map(
  (pattern) => pattern.name,
) as DateSelectorPatternName[];
