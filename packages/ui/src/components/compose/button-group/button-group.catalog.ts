import type { ComposeRenderablePatternSpec } from "../compose.contract";
import { ButtonGroupBasicWithTwoButtons } from "./button-group-basic-with-two-buttons";
import { ButtonGroupPagination } from "./button-group-pagination";
import { ButtonGroupToolbarFilterSortAndMore } from "./button-group-toolbar-filter-sort-and-more";
import { ButtonGroupViewSwitcher } from "./button-group-view-switcher";

export type ButtonGroupPatternSpec = ComposeRenderablePatternSpec;

export const buttonGroupPatternCatalog = [
  {
    name: "basic-two-buttons",
    title: "Basic Two Buttons",
    description: "A simple grouped action pair.",
    component: ButtonGroupBasicWithTwoButtons,
  },
  {
    name: "pagination",
    title: "Pagination",
    description: "Pagination controls.",
    component: ButtonGroupPagination,
  },
  {
    name: "view-switcher",
    title: "View Switcher",
    description: "A segmented view selector.",
    component: ButtonGroupViewSwitcher,
  },
  {
    name: "toolbar-filter-sort-more",
    title: "Toolbar Filter Sort More",
    description: "A dense toolbar command group.",
    component: ButtonGroupToolbarFilterSortAndMore,
  },
] as const satisfies readonly ButtonGroupPatternSpec[];

export type ButtonGroupPatternName =
  (typeof buttonGroupPatternCatalog)[number]["name"];

export const buttonGroupPatternCount = buttonGroupPatternCatalog.length;
export const buttonGroupPatternNames = buttonGroupPatternCatalog.map(
  (pattern) => pattern.name,
) as ButtonGroupPatternName[];
