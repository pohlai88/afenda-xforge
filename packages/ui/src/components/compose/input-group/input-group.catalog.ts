import type { ComposeRenderablePatternSpec } from "../compose.contract";
import { InputGroupBasic } from "./input-group-basic";
import { InputGroupBlockStart } from "./input-group-block-start";
import { InputGroupWithButton } from "./input-group-with-button";
import { InputGroupWithIcon } from "./input-group-with-icon";

export type InputGroupPatternSpec = ComposeRenderablePatternSpec;

export const inputGroupPatternCatalog = [
  {
    name: "basic",
    title: "Basic",
    description: "A basic input group for text entry.",
    component: InputGroupBasic,
  },
  {
    name: "with-icon",
    title: "With Icon",
    description: "An input group with a leading icon addon.",
    component: InputGroupWithIcon,
  },
  {
    name: "with-button",
    title: "With Button",
    description: "An input group with a trailing action button.",
    component: InputGroupWithButton,
  },
  {
    name: "block-start",
    title: "Block Start",
    description: "An input group with a block-level header addon.",
    component: InputGroupBlockStart,
  },
] as const satisfies readonly InputGroupPatternSpec[];

export type InputGroupPatternName =
  (typeof inputGroupPatternCatalog)[number]["name"];

export const inputGroupPatternCount = inputGroupPatternCatalog.length;
export const inputGroupPatternNames = inputGroupPatternCatalog.map(
  (pattern) => pattern.name,
) as InputGroupPatternName[];
