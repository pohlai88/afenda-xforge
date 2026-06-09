import type { ComposeRenderablePatternSpec } from "../compose.contract";
import { EmptyActions } from "./empty-actions";
import { EmptyAvatar } from "./empty-avatar";
import { EmptyBasic } from "./empty-basic";
import { EmptyInputGroup } from "./empty-input-group";

export type EmptyPatternSpec = ComposeRenderablePatternSpec;

export const emptyPatternCatalog = [
  {
    name: "basic",
    title: "Basic",
    description: "A simple empty state.",
    component: EmptyBasic,
  },
  {
    name: "actions",
    title: "Actions",
    description: "An empty state with primary and secondary actions.",
    component: EmptyActions,
  },
  {
    name: "avatar",
    title: "Avatar",
    description: "An empty state framed by collaborator identity.",
    component: EmptyAvatar,
  },
  {
    name: "input-group",
    title: "Input Group",
    description: "An empty state with inline input capture.",
    component: EmptyInputGroup,
  },
] as const satisfies readonly EmptyPatternSpec[];

export type EmptyPatternName = (typeof emptyPatternCatalog)[number]["name"];

export const emptyPatternCount = emptyPatternCatalog.length;
export const emptyPatternNames = emptyPatternCatalog.map(
  (pattern) => pattern.name,
) as EmptyPatternName[];
