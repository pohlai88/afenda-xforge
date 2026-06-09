import type { ComposeRenderablePatternSpec } from "../compose.contract";
import { SkeletonAvatar } from "./skeleton-avatar";
import { SkeletonCardPattern } from "./skeleton-card";
import { SkeletonTable } from "./skeleton-table";
import { SkeletonText } from "./skeleton-text";

export type SkeletonPatternSpec = ComposeRenderablePatternSpec;

export const skeletonPatternCatalog = [
  {
    name: "text",
    title: "Text",
    description: "Text line loading placeholders.",
    component: SkeletonText,
  },
  {
    name: "avatar",
    title: "Avatar",
    description: "Profile loading placeholders.",
    component: SkeletonAvatar,
  },
  {
    name: "card",
    title: "Card",
    description: "Card loading placeholders.",
    component: SkeletonCardPattern,
  },
  {
    name: "table",
    title: "Table",
    description: "Table loading placeholders.",
    component: SkeletonTable,
  },
] as const satisfies readonly SkeletonPatternSpec[];

export type SkeletonPatternName =
  (typeof skeletonPatternCatalog)[number]["name"];

export const skeletonPatternCount = skeletonPatternCatalog.length;
export const skeletonPatternNames = skeletonPatternCatalog.map(
  (pattern) => pattern.name,
) as SkeletonPatternName[];
