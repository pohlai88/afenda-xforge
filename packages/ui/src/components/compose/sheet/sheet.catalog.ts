import type { ComposeRenderablePatternSpec } from "../compose.contract";
import { SheetBasic } from "./sheet-basic";
import { SheetLeft } from "./sheet-left";
import { SheetNoCloseButton } from "./sheet-no-close-button";
import { SheetTop } from "./sheet-top";

export type SheetPatternSpec = ComposeRenderablePatternSpec;

export const sheetPatternCatalog = [
  {
    name: "basic",
    title: "Basic",
    description: "A standard side sheet.",
    component: SheetBasic,
  },
  {
    name: "left",
    title: "Left",
    description: "A left-side sheet for supporting context.",
    component: SheetLeft,
  },
  {
    name: "no-close-button",
    title: "No Close Button",
    description: "A sheet that relies on explicit footer actions.",
    component: SheetNoCloseButton,
  },
  {
    name: "top",
    title: "Top",
    description: "A top sheet for compact summary content.",
    component: SheetTop,
  },
] as const satisfies readonly SheetPatternSpec[];

export type SheetPatternName = (typeof sheetPatternCatalog)[number]["name"];

export const sheetPatternCount = sheetPatternCatalog.length;
export const sheetPatternNames = sheetPatternCatalog.map(
  (pattern) => pattern.name,
) as SheetPatternName[];
