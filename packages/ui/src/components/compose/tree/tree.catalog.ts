import type { ComposeRenderablePatternSpec } from "../compose.contract";
import { TreeFileExplorerWithTypeIcons } from "./file-explorer-tree-with-type-icons";
import { TreePermissionsWithCheckboxes } from "./permissions-tree-with-checkboxes";
import { TreeBasic } from "./tree-basic";
import { TreeWithIndentedLines } from "./tree-with-indented-lines";

export type TreePatternSpec = ComposeRenderablePatternSpec;

export const treePatternCatalog = [
  {
    name: "basic",
    title: "Basic",
    description: "A basic hierarchical tree view.",
    component: TreeBasic,
  },
  {
    name: "indented-lines",
    title: "Indented Lines",
    description: "A tree with visual hierarchy guide lines.",
    component: TreeWithIndentedLines,
  },
  {
    name: "file-explorer",
    title: "File Explorer",
    description: "A file explorer tree with typed nodes.",
    component: TreeFileExplorerWithTypeIcons,
  },
  {
    name: "permissions",
    title: "Permissions",
    description: "A selectable permissions tree with checkbox state.",
    component: TreePermissionsWithCheckboxes,
  },
] as const satisfies readonly TreePatternSpec[];

export type TreePatternName = (typeof treePatternCatalog)[number]["name"];

export const treePatternCount = treePatternCatalog.length;
export const treePatternNames = treePatternCatalog.map(
  (pattern) => pattern.name,
) as TreePatternName[];
