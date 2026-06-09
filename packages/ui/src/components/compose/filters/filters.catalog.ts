import type * as React from "react";

import { FiltersBasic } from "./filters-basic";
import { FiltersCustomControls } from "./filters-custom-controls";
import { FiltersDataGrid } from "./filters-data-grid";
import { FiltersI18nSupport } from "./filters-i18n-support";
import { FiltersLargeSize } from "./filters-large-size";
import { FiltersNuqs } from "./filters-nuqs";
import { FiltersSmallSize } from "./filters-small-size";
import { FiltersTriggerButton } from "./filters-trigger-button";
import { FiltersValidation } from "./filters-validation";

export type FiltersPatternSpec = {
  name: string;
  title: string;
  description: string;
  component: React.ComponentType;
};

export const filtersPatternCatalog = [
  {
    name: "basic",
    title: "Filters",
    description:
      "A flexible filtering bar for common table and list workflows.",
    component: FiltersBasic,
  },
  {
    name: "validation",
    title: "Validation",
    description: "Reject invalid values before a filter is added.",
    component: FiltersValidation,
  },
  {
    name: "trigger-button",
    title: "Trigger Button",
    description: "Use a custom trigger for tighter toolbar integration.",
    component: FiltersTriggerButton,
  },
  {
    name: "small-size",
    title: "Small Size",
    description: "A compact density for tight layouts and dense dashboards.",
    component: FiltersSmallSize,
  },
  {
    name: "large-size",
    title: "Large Size",
    description: "A spacious density for showcase pages and detail views.",
    component: FiltersLargeSize,
  },
  {
    name: "custom-controls",
    title: "Custom Controls",
    description: "Swap the default input with a custom builder.",
    component: FiltersCustomControls,
  },
  {
    name: "data-grid",
    title: "Data Grid",
    description: "Wire filters directly into a table of records.",
    component: FiltersDataGrid,
  },
  {
    name: "nuqs",
    title: "Nuqs",
    description: "Keep filters in sync with the URL query string.",
    component: FiltersNuqs,
  },
  {
    name: "i18n-support",
    title: "With i18n Support",
    description: "Localize labels, operators, and placeholders.",
    component: FiltersI18nSupport,
  },
] as const satisfies readonly FiltersPatternSpec[];

export type FiltersPatternName = (typeof filtersPatternCatalog)[number]["name"];

export const filtersPatternCount = filtersPatternCatalog.length;
export const filtersPatternNames = filtersPatternCatalog.map(
  (pattern) => pattern.name,
) as FiltersPatternName[];
