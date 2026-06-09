import type { ComposeRenderablePatternSpec } from "../compose.contract";
import { FieldCheckboxPattern } from "./field-checkbox";
import { FieldGroupPattern } from "./field-group";
import { FieldInputPattern } from "./field-input";
import { FieldResponsive } from "./field-responsive";

export type FieldPatternSpec = ComposeRenderablePatternSpec;

export const fieldPatternCatalog = [
  {
    name: "input",
    title: "Input",
    description: "A standard labeled input field layout.",
    component: FieldInputPattern,
  },
  {
    name: "checkbox",
    title: "Checkbox",
    description: "A horizontal field for binary settings.",
    component: FieldCheckboxPattern,
  },
  {
    name: "responsive",
    title: "Responsive",
    description: "A field layout that adapts between stacked and inline modes.",
    component: FieldResponsive,
  },
  {
    name: "group",
    title: "Group",
    description: "A grouped form section with subsection separation.",
    component: FieldGroupPattern,
  },
] as const satisfies readonly FieldPatternSpec[];

export type FieldPatternName = (typeof fieldPatternCatalog)[number]["name"];

export const fieldPatternCount = fieldPatternCatalog.length;
export const fieldPatternNames = fieldPatternCatalog.map(
  (pattern) => pattern.name,
) as FieldPatternName[];
