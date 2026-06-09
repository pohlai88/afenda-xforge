import type * as React from "react";

import { SortableDefault } from "./sortable-default";
import { SortableGrid } from "./sortable-grid";
import { SortableNested } from "./sortable-nested";

export type SortablePatternSpec = {
  name: string;
  title: string;
  description: string;
  component: React.ComponentType;
};

export const sortablePatternCatalog = [
  {
    name: "default",
    title: "Default",
    description: "A standard vertical sortable list for reordering items.",
    component: SortableDefault,
  },
  {
    name: "grid",
    title: "Grid",
    description: "A compact media grid with drag handles for tile reordering.",
    component: SortableGrid,
  },
  {
    name: "nested",
    title: "Nested",
    description: "Grouped collections that stay independently sortable.",
    component: SortableNested,
  },
] as const satisfies readonly SortablePatternSpec[];

export type SortablePatternName =
  (typeof sortablePatternCatalog)[number]["name"];

export const sortablePatternCount = sortablePatternCatalog.length;
export const sortablePatternNames = sortablePatternCatalog.map(
  (pattern) => pattern.name,
) as SortablePatternName[];
