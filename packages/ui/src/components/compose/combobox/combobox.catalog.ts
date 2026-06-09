import type { ComposeRenderablePatternSpec } from "../compose.contract";
import { ComboboxBasic } from "./combobox-basic";
import { ComboboxForm } from "./combobox-form";
import { ComboboxInsidePopup } from "./combobox-inside-popup";
import { ComboboxInvalid } from "./combobox-invalid";
import { ComboboxMultiSelect } from "./combobox-multi-select";
import { ComboboxWithGroups } from "./combobox-with-groups";

export type ComboboxPatternSpec = ComposeRenderablePatternSpec;

export const comboboxPatternCatalog = [
  {
    name: "basic",
    title: "Basic",
    description: "A searchable single-select combobox.",
    component: ComboboxBasic,
  },
  {
    name: "multi-select",
    title: "Multi Select",
    description: "A multi-select combobox for collection fields.",
    component: ComboboxMultiSelect,
  },
  {
    name: "with-groups",
    title: "With Groups",
    description: "A grouped combobox for categorized options.",
    component: ComboboxWithGroups,
  },
  {
    name: "popup",
    title: "Popup",
    description: "A combobox rendered inside a popup panel.",
    component: ComboboxInsidePopup,
  },
  {
    name: "invalid",
    title: "Invalid",
    description: "A combobox with validation state treatment.",
    component: ComboboxInvalid,
  },
  {
    name: "form",
    title: "Form",
    description: "A combobox embedded in a validated form layout.",
    component: ComboboxForm,
  },
] as const satisfies readonly ComboboxPatternSpec[];

export type ComboboxPatternName =
  (typeof comboboxPatternCatalog)[number]["name"];

export const comboboxPatternCount = comboboxPatternCatalog.length;
export const comboboxPatternNames = comboboxPatternCatalog.map(
  (pattern) => pattern.name,
) as ComboboxPatternName[];
