import type { ComposeRenderablePatternSpec } from "../compose.contract";
import { ButtonAsInput } from "./button-as-input";
import { ButtonBadge } from "./button-badge";
import { ButtonDashed } from "./button-dashed";
import { ButtonDestructive } from "./button-destructive";
import { ButtonDisabled } from "./button-disabled";
import { ButtonFullWidth } from "./button-full-width";
import { ButtonGhost } from "./button-ghost";
import { ButtonIconOnly } from "./button-icon-only";
import { ButtonLink } from "./button-link";
import { ButtonLoading } from "./button-loading";
import { ButtonMono } from "./button-mono";
import { ButtonOutline } from "./button-outline";
import { ButtonRadiusFull } from "./button-radius-full";
import { ButtonSecondary } from "./button-secondary";
import { ButtonSize } from "./button-size";
import { ButtonWithIcon } from "./button-with-icon";

export const buttonPatternCatalog = [
  {
    name: "with-icon",
    title: "With Icon",
    description: "A standard action button with leading icon support.",
    component: ButtonWithIcon,
  },
  {
    name: "icon-only",
    title: "Icon Only",
    description: "A compact icon action for toolbars and dense controls.",
    component: ButtonIconOnly,
  },
  {
    name: "loading",
    title: "Loading",
    description: "A submit button with a pending state.",
    component: ButtonLoading,
  },
  {
    name: "destructive",
    title: "Destructive",
    description: "A button preset for destructive actions.",
    component: ButtonDestructive,
  },
  {
    name: "secondary",
    title: "Secondary",
    description: "A low-emphasis action button.",
    component: ButtonSecondary,
  },
  {
    name: "outline",
    title: "Outline",
    description: "A bordered action button for secondary commands.",
    component: ButtonOutline,
  },
  {
    name: "ghost",
    title: "Ghost",
    description: "A quiet action button for inline controls.",
    component: ButtonGhost,
  },
  {
    name: "link",
    title: "Link",
    description: "A button styled as navigational text.",
    component: ButtonLink,
  },
  {
    name: "disabled",
    title: "Disabled",
    description: "A disabled state preset for unavailable actions.",
    component: ButtonDisabled,
  },
  {
    name: "full-width",
    title: "Full Width",
    description: "A block-level button for forms and mobile surfaces.",
    component: ButtonFullWidth,
  },
  {
    name: "size",
    title: "Size",
    description: "A size-scale preset for button density decisions.",
    component: ButtonSize,
  },
  {
    name: "badge",
    title: "Badge",
    description: "An action button with a compact count or status badge.",
    component: ButtonBadge,
  },
  {
    name: "as-input",
    title: "As Input",
    description: "A button styled to sit with input controls.",
    component: ButtonAsInput,
  },
  {
    name: "dashed",
    title: "Dashed",
    description: "A dashed action style for add or placeholder actions.",
    component: ButtonDashed,
  },
  {
    name: "mono",
    title: "Mono",
    description: "A monospace action for technical values or commands.",
    component: ButtonMono,
  },
  {
    name: "radius-full",
    title: "Full Radius",
    description: "A pill-shaped button preset.",
    component: ButtonRadiusFull,
  },
] as const satisfies readonly ComposeRenderablePatternSpec[];

export type ButtonPatternName = (typeof buttonPatternCatalog)[number]["name"];

export const buttonPatternCount = buttonPatternCatalog.length;
export const buttonPatternNames = buttonPatternCatalog.map(
  (pattern) => pattern.name,
) as ButtonPatternName[];
