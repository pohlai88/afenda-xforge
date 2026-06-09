import type { ComposeRenderablePatternSpec } from "../compose.contract";
import { CollapsibleBasic } from "./collapsible-basic";
import { CollapsibleFormFields } from "./collapsible-form-fields";
import { CollapsibleMultiLevelMenu } from "./collapsible-multi-level-menu";
import { CollapsibleWithCheckboxSettings } from "./collapsible-with-checkbox-settings";

export type CollapsiblePatternSpec = ComposeRenderablePatternSpec;

export const collapsiblePatternCatalog = [
  {
    name: "basic",
    title: "Basic",
    description: "A simple collapsible section for progressive disclosure.",
    component: CollapsibleBasic,
  },
  {
    name: "form-fields",
    title: "Form Fields",
    description: "A collapsible section that groups form fields.",
    component: CollapsibleFormFields,
  },
  {
    name: "multi-level-menu",
    title: "Multi Level Menu",
    description: "A nested collapsible menu for hierarchical navigation.",
    component: CollapsibleMultiLevelMenu,
  },
  {
    name: "checkbox-settings",
    title: "Checkbox Settings",
    description: "A settings panel with collapsible grouped toggles.",
    component: CollapsibleWithCheckboxSettings,
  },
] as const satisfies readonly CollapsiblePatternSpec[];

export type CollapsiblePatternName =
  (typeof collapsiblePatternCatalog)[number]["name"];

export const collapsiblePatternCount = collapsiblePatternCatalog.length;
export const collapsiblePatternNames = collapsiblePatternCatalog.map(
  (pattern) => pattern.name,
) as CollapsiblePatternName[];
