import type * as React from "react";

import { ScrollspyHorizontal } from "./scrollspy-horizontal";
import { ScrollspyVertical } from "./scrollspy-vertical";

export type ScrollspyPatternSpec = {
  name: string;
  title: string;
  description: string;
  component: React.ComponentType;
};

export const scrollspyPatternCatalog = [
  {
    name: "vertical",
    title: "Vertical Scrollspy",
    description: "A sidebar navigation for long-form content sections.",
    component: ScrollspyVertical,
  },
  {
    name: "horizontal",
    title: "Horizontal Scrollspy",
    description: "A compact top navigation with active section tracking.",
    component: ScrollspyHorizontal,
  },
] as const satisfies readonly ScrollspyPatternSpec[];

export type ScrollspyPatternName =
  (typeof scrollspyPatternCatalog)[number]["name"];

export const scrollspyPatternCount = scrollspyPatternCatalog.length;
export const scrollspyPatternNames = scrollspyPatternCatalog.map(
  (pattern) => pattern.name,
) as ScrollspyPatternName[];
