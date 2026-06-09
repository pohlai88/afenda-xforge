import type * as React from "react";

import { BadgeDestructive } from "./badge-destructive";
import { BadgeDestructiveLight } from "./badge-destructive-light";
import { BadgeDestructiveOutline } from "./badge-destructive-outline";
import { BadgeFullRadius } from "./badge-full-radius";
import { BadgeInfo } from "./badge-info";
import { BadgeInfoLight } from "./badge-info-light";
import { BadgeInfoOutline } from "./badge-info-outline";
import { BadgeInvertLight } from "./badge-invert-light";
import { BadgeInvertOutline } from "./badge-invert-outline";
import { BadgeOutline } from "./badge-outline";
import { BadgePrimaryLight } from "./badge-primary-light";
import { BadgePrimaryOutline } from "./badge-primary-outline";
import { BadgeSecondary } from "./badge-secondary";
import { BadgeSize } from "./badge-size";
import { BadgeSuccess } from "./badge-success";
import { BadgeSuccessLight } from "./badge-success-light";
import { BadgeSuccessOutline } from "./badge-success-outline";
import { BadgeWarning } from "./badge-warning";
import { BadgeWarningLight } from "./badge-warning-light";
import { BadgeWarningOutline } from "./badge-warning-outline";
import { BadgeWithDot } from "./badge-with-dot";
import { BadgeWithIcon } from "./badge-with-icon";
import { BadgeWithIconButton } from "./badge-with-icon-button";
import { BadgeWithLink } from "./badge-with-link";

export type BadgePatternSpec = {
  name: string;
  title: string;
  description: string;
  component: React.ComponentType;
};

export const badgePatternCatalog = [
  {
    name: "secondary",
    title: "Secondary",
    description: "The default non-primary badge style.",
    component: BadgeSecondary,
  },
  {
    name: "destructive",
    title: "Destructive",
    description: "Highlights error or destructive status.",
    component: BadgeDestructive,
  },
  {
    name: "success",
    title: "Success",
    description: "Uses the positive state color for success.",
    component: BadgeSuccess,
  },
  {
    name: "info",
    title: "Info",
    description: "Uses the informational state color.",
    component: BadgeInfo,
  },
  {
    name: "warning",
    title: "Warning",
    description: "Signals a cautionary or attention state.",
    component: BadgeWarning,
  },
  {
    name: "outline",
    title: "Outline",
    description: "A neutral outlined badge for general use.",
    component: BadgeOutline,
  },
  {
    name: "primary-outline",
    title: "Primary Outline",
    description: "A primary-toned outline badge.",
    component: BadgePrimaryOutline,
  },
  {
    name: "destructive-outline",
    title: "Destructive Outline",
    description: "An outlined destructive badge variant.",
    component: BadgeDestructiveOutline,
  },
  {
    name: "info-outline",
    title: "Info Outline",
    description: "An outlined informational badge variant.",
    component: BadgeInfoOutline,
  },
  {
    name: "success-outline",
    title: "Success Outline",
    description: "An outlined success badge variant.",
    component: BadgeSuccessOutline,
  },
  {
    name: "warning-outline",
    title: "Warning Outline",
    description: "An outlined warning badge variant.",
    component: BadgeWarningOutline,
  },
  {
    name: "invert-outline",
    title: "Invert Outline",
    description: "A high-contrast outlined inverse badge.",
    component: BadgeInvertOutline,
  },
  {
    name: "primary-light",
    title: "Primary Light",
    description: "A subtle tinted primary badge.",
    component: BadgePrimaryLight,
  },
  {
    name: "destructive-light",
    title: "Destructive Light",
    description: "A subtle tinted destructive badge.",
    component: BadgeDestructiveLight,
  },
  {
    name: "success-light",
    title: "Success Light",
    description: "A subtle tinted success badge.",
    component: BadgeSuccessLight,
  },
  {
    name: "info-light",
    title: "Info Light",
    description: "A subtle tinted informational badge.",
    component: BadgeInfoLight,
  },
  {
    name: "warning-light",
    title: "Warning Light",
    description: "A subtle tinted warning badge.",
    component: BadgeWarningLight,
  },
  {
    name: "invert-light",
    title: "Invert Light",
    description: "A subtle inverse-tone badge.",
    component: BadgeInvertLight,
  },
  {
    name: "size",
    title: "Size",
    description: "Demonstrates the available badge sizes.",
    component: BadgeSize,
  },
  {
    name: "full-radius",
    title: "Full Radius",
    description: "Uses a fully rounded radius treatment.",
    component: BadgeFullRadius,
  },
  {
    name: "with-icon",
    title: "With Icon",
    description: "Pairs the badge with an inline icon.",
    component: BadgeWithIcon,
  },
  {
    name: "with-icon-button",
    title: "With Icon Button",
    description: "Combines a badge with an action button.",
    component: BadgeWithIconButton,
  },
  {
    name: "with-dot",
    title: "With Dot",
    description: "Adds a status dot for quick scanning.",
    component: BadgeWithDot,
  },
  {
    name: "with-link",
    title: "With Link",
    description: "Turns the badge into a navigational link.",
    component: BadgeWithLink,
  },
] as const satisfies readonly BadgePatternSpec[];

export type BadgePatternName = (typeof badgePatternCatalog)[number]["name"];

export const badgePatternCount = badgePatternCatalog.length;
export const badgePatternNames = badgePatternCatalog.map(
  (pattern) => pattern.name,
) as BadgePatternName[];
