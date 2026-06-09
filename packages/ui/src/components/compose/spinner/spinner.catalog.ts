import type { ComposeRenderablePatternSpec } from "../compose.contract";
import { SpinnerBasic } from "./spinner-basic";
import { SpinnerButtonLoadingStates } from "./spinner-button-loading-states";
import { SpinnerInlineLoadingTextWithSpinner } from "./spinner-inline-loading-text-with-spinner";
import { SpinnerOverlayLoadingSpinner } from "./spinner-overlay-loading-spinner";

export type SpinnerPatternSpec = ComposeRenderablePatternSpec;

export const spinnerPatternCatalog = [
  {
    name: "basic",
    title: "Basic",
    description: "A basic loading spinner.",
    component: SpinnerBasic,
  },
  {
    name: "button-loading",
    title: "Button Loading",
    description: "A button state with inline spinner feedback.",
    component: SpinnerButtonLoadingStates,
  },
  {
    name: "inline-loading-text",
    title: "Inline Loading Text",
    description: "A spinner paired with compact loading text.",
    component: SpinnerInlineLoadingTextWithSpinner,
  },
  {
    name: "overlay",
    title: "Overlay",
    description: "An overlay loading state for blocking operations.",
    component: SpinnerOverlayLoadingSpinner,
  },
] as const satisfies readonly SpinnerPatternSpec[];

export type SpinnerPatternName = (typeof spinnerPatternCatalog)[number]["name"];

export const spinnerPatternCount = spinnerPatternCatalog.length;
export const spinnerPatternNames = spinnerPatternCatalog.map(
  (pattern) => pattern.name,
) as SpinnerPatternName[];
