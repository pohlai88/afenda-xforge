import type { ComposeRenderablePatternSpec } from "../compose.contract";
import { TabsBadge } from "./tabs-badge";
import { TabsDefault } from "./tabs-default";
import { TabsLine } from "./tabs-line";
import { TabsPill } from "./tabs-pill";
import { TabsVertical } from "./tabs-vertical";

export type TabsPatternSpec = ComposeRenderablePatternSpec;

export const tabsPatternCatalog = [
  {
    name: "default",
    title: "Default",
    description: "A standard tab list for grouped content views.",
    component: TabsDefault,
  },
  {
    name: "line",
    title: "Line",
    description: "A line-style tab treatment for dense layouts.",
    component: TabsLine,
  },
  {
    name: "pill",
    title: "Pill",
    description: "A pill-style tab treatment for segmented views.",
    component: TabsPill,
  },
  {
    name: "vertical",
    title: "Vertical",
    description: "A vertical tab layout for sidebar-style navigation.",
    component: TabsVertical,
  },
  {
    name: "badge",
    title: "Badge",
    description: "A tab list with status or count badges.",
    component: TabsBadge,
  },
] as const satisfies readonly TabsPatternSpec[];

export type TabsPatternName = (typeof tabsPatternCatalog)[number]["name"];

export const tabsPatternCount = tabsPatternCatalog.length;
export const tabsPatternNames = tabsPatternCatalog.map(
  (pattern) => pattern.name,
) as TabsPatternName[];
