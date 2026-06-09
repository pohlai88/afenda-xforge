import type * as React from "react";

import { FrameBasic } from "./frame-basic";
import { FrameCustomRadius } from "./frame-custom-radius";
import { FrameCustomSpacing } from "./frame-custom-spacing";
import { FrameDensePanels } from "./frame-dense-panels";
import { FrameSeparatedPanels } from "./frame-separated-panels";
import { FrameStackedPanels } from "./frame-stacked-panels";
import { FrameWithoutOuterBorder } from "./frame-without-outer-border";

export type FramePatternSpec = {
  name: string;
  title: string;
  description: string;
  component: React.ComponentType;
};

export const framePatternCatalog = [
  {
    name: "basic",
    title: "Frame",
    description: "A frame with a header, content, and footer.",
    component: FrameBasic,
  },
  {
    name: "separated-panels",
    title: "With Separated Panels",
    description: "Multiple panels with clear separation between sections.",
    component: FrameSeparatedPanels,
  },
  {
    name: "stacked-panels",
    title: "With Stacked Panels",
    description: "Panels are visually connected into one stacked surface.",
    component: FrameStackedPanels,
  },
  {
    name: "dense-panels",
    title: "With Dense Panels",
    description: "A compact layout with less padding and tighter spacing.",
    component: FrameDensePanels,
  },
  {
    name: "without-outer-border",
    title: "Without Outer Border",
    description: "A lighter presentation with the outer shell removed.",
    component: FrameWithoutOuterBorder,
  },
  {
    name: "custom-spacing",
    title: "Custom Spacing",
    description: "Adjust the space between panels for looser compositions.",
    component: FrameCustomSpacing,
  },
  {
    name: "custom-radius",
    title: "Custom Radius",
    description: "Override the frame radius with a CSS variable.",
    component: FrameCustomRadius,
  },
] as const satisfies readonly FramePatternSpec[];

export type FramePatternName = (typeof framePatternCatalog)[number]["name"];

export const framePatternCount = framePatternCatalog.length;
export const framePatternNames = framePatternCatalog.map(
  (pattern) => pattern.name,
) as FramePatternName[];
