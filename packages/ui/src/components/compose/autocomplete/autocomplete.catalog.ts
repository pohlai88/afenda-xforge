import type * as React from "react";

import { AutocompleteAsyncSearch } from "./autocomplete-async-search";
import { AutocompleteAutoHighlight } from "./autocomplete-auto-highlight";
import { AutocompleteBasic } from "./autocomplete-basic";
import { AutocompleteDisabled } from "./autocomplete-disabled";
import { AutocompleteForm } from "./autocomplete-form";
import { AutocompleteSize } from "./autocomplete-size";
import { AutocompleteWithClearButton } from "./autocomplete-with-clear-button";
import { AutocompleteWithGroups } from "./autocomplete-with-groups";
import { AutocompleteWithLabel } from "./autocomplete-with-label";
import { AutocompleteWithTriggerAndClearButtons } from "./autocomplete-with-trigger-and-clear-buttons";
import { AutocompleteWithTriggerButton } from "./autocomplete-with-trigger-button";

export type AutocompletePatternSpec = {
  name: string;
  title: string;
  description: string;
  component: React.ComponentType;
};

export const autocompletePatternCatalog = [
  {
    name: "basic",
    title: "Autocomplete",
    description: "A compact search input with a filtered suggestion list.",
    component: AutocompleteBasic,
  },
  {
    name: "disabled",
    title: "Disabled",
    description: "The field remains visible while interaction is blocked.",
    component: AutocompleteDisabled,
  },
  {
    name: "auto-highlight",
    title: "Auto Highlight",
    description: "The first match is highlighted as soon as the user types.",
    component: AutocompleteAutoHighlight,
  },
  {
    name: "with-label",
    title: "With Label",
    description: "Adds a descriptive label while keeping the input compact.",
    component: AutocompleteWithLabel,
  },
  {
    name: "with-clear-button",
    title: "With Clear Button",
    description: "Users can clear the current query without leaving the field.",
    component: AutocompleteWithClearButton,
  },
  {
    name: "with-trigger-button",
    title: "With Trigger Button",
    description: "A button reveals the suggestion list on demand.",
    component: AutocompleteWithTriggerButton,
  },
  {
    name: "with-trigger-and-clear-buttons",
    title: "With Trigger and Clear Buttons",
    description: "Combines a manual trigger with a one-click reset.",
    component: AutocompleteWithTriggerAndClearButtons,
  },
  {
    name: "with-groups",
    title: "With Groups",
    description: "Related options are grouped with headings inside the popup.",
    component: AutocompleteWithGroups,
  },
  {
    name: "async-search",
    title: "Async Search",
    description: "Results are updated from an async source while typing.",
    component: AutocompleteAsyncSearch,
  },
  {
    name: "size",
    title: "Size",
    description: "Shows the available density and size variants.",
    component: AutocompleteSize,
  },
  {
    name: "form",
    title: "Form",
    description:
      "The autocomplete can participate in a regular form submission.",
    component: AutocompleteForm,
  },
] as const satisfies readonly AutocompletePatternSpec[];

export type AutocompletePatternName =
  (typeof autocompletePatternCatalog)[number]["name"];

export const autocompletePatternCount = autocompletePatternCatalog.length;
export const autocompletePatternNames = autocompletePatternCatalog.map(
  (pattern) => pattern.name,
) as AutocompletePatternName[];
