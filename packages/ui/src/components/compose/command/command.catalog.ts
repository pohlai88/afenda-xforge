import type { ComposeRenderablePatternSpec } from "../compose.contract";
import { CommandBasic } from "./command-basic";
import { CommandDialogPattern } from "./command-dialog";
import { CommandGroups } from "./command-groups";
import { CommandShortcuts } from "./command-shortcuts";

export type CommandPatternSpec = ComposeRenderablePatternSpec;

export const commandPatternCatalog = [
  {
    name: "basic",
    title: "Basic",
    description: "A basic command surface for quick lookup.",
    component: CommandBasic,
  },
  {
    name: "groups",
    title: "Groups",
    description: "Command items grouped by functional area.",
    component: CommandGroups,
  },
  {
    name: "shortcuts",
    title: "Shortcuts",
    description: "Command items with keyboard shortcut labels.",
    component: CommandShortcuts,
  },
  {
    name: "dialog",
    title: "Dialog",
    description: "A modal command palette for global actions.",
    component: CommandDialogPattern,
  },
] as const satisfies readonly CommandPatternSpec[];

export type CommandPatternName = (typeof commandPatternCatalog)[number]["name"];

export const commandPatternCount = commandPatternCatalog.length;
export const commandPatternNames = commandPatternCatalog.map(
  (pattern) => pattern.name,
) as CommandPatternName[];
