import type { ComposeRenderablePatternSpec } from "../compose.contract";
import { DropdownMenuBasic } from "./dropdown-menu-basic";
import { DropdownMenuCheckboxes } from "./dropdown-menu-checkboxes";
import { DropdownMenuDestructive } from "./dropdown-menu-destructive";
import { DropdownMenuRadioGroupPattern } from "./dropdown-menu-radio-group";

export type DropdownMenuPatternSpec = ComposeRenderablePatternSpec;

export const dropdownMenuPatternCatalog = [
  {
    name: "basic",
    title: "Basic",
    description: "A standard dropdown menu.",
    component: DropdownMenuBasic,
  },
  {
    name: "checkboxes",
    title: "Checkboxes",
    description: "A dropdown menu with multi-select toggles.",
    component: DropdownMenuCheckboxes,
  },
  {
    name: "radio-group",
    title: "Radio Group",
    description: "A dropdown menu with single-choice options.",
    component: DropdownMenuRadioGroupPattern,
  },
  {
    name: "destructive",
    title: "Destructive",
    description: "A dropdown menu with destructive actions.",
    component: DropdownMenuDestructive,
  },
] as const satisfies readonly DropdownMenuPatternSpec[];

export type DropdownMenuPatternName =
  (typeof dropdownMenuPatternCatalog)[number]["name"];

export const dropdownMenuPatternCount = dropdownMenuPatternCatalog.length;
export const dropdownMenuPatternNames = dropdownMenuPatternCatalog.map(
  (pattern) => pattern.name,
) as DropdownMenuPatternName[];
