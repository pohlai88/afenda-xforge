import type { ComposeRenderablePatternSpec } from "../compose.contract";
import { AccordionBasicSingleExpand } from "./accordion-basic-single-expand";
import { AccordionBordersRounded } from "./accordion-borders-rounded";
import { AccordionCustomIconsBadges } from "./accordion-custom-icons-badges";
import { AccordionDisabledHighlighted } from "./accordion-disabled-highlighted";
import { AccordionEmbeddedInCard } from "./accordion-embedded-in-card";
import { AccordionFramePanels } from "./accordion-frame-panels";
import { AccordionNestedBorderedItems } from "./accordion-nested-bordered-items";
import { AccordionOnboardingSetupSteps } from "./accordion-onboarding-setup-steps";
import { AccordionPlusMinusIndicators } from "./accordion-plus-minus-indicators";
import { AccordionRotatingArrowIndicator } from "./accordion-rotating-arrow-indicator";
import { AccordionUserListAvatars } from "./accordion-user-list-avatars";

export const accordionPatternCatalog = [
  {
    name: "basic-single-expand",
    title: "Basic Single Expand",
    description: "A single-open accordion for compact disclosure content.",
    component: AccordionBasicSingleExpand,
  },
  {
    name: "borders-rounded",
    title: "Bordered Rounded",
    description: "A bordered accordion for grouped detail sections.",
    component: AccordionBordersRounded,
  },
  {
    name: "custom-icons-badges",
    title: "Icons And Badges",
    description: "An accordion with status icons and count badges.",
    component: AccordionCustomIconsBadges,
  },
  {
    name: "disabled-highlighted",
    title: "Disabled Highlighted",
    description: "A mixed-state accordion with disabled and highlighted rows.",
    component: AccordionDisabledHighlighted,
  },
  {
    name: "embedded-in-card",
    title: "Embedded In Card",
    description: "Accordion content framed for card-based detail regions.",
    component: AccordionEmbeddedInCard,
  },
  {
    name: "frame-panels",
    title: "Frame Panels",
    description: "Accordion panels composed inside reusable frames.",
    component: AccordionFramePanels,
  },
  {
    name: "nested-bordered-items",
    title: "Nested Bordered Items",
    description: "Nested accordion items for hierarchical records.",
    component: AccordionNestedBorderedItems,
  },
  {
    name: "onboarding-steps",
    title: "Onboarding Steps",
    description: "Progressive accordion sections for setup workflows.",
    component: AccordionOnboardingSetupSteps,
  },
  {
    name: "plus-minus-indicators",
    title: "Plus Minus Indicators",
    description: "Disclosure rows with explicit expand and collapse icons.",
    component: AccordionPlusMinusIndicators,
  },
  {
    name: "rotating-arrow-indicator",
    title: "Rotating Arrow Indicator",
    description: "Accordion rows with a directional trigger indicator.",
    component: AccordionRotatingArrowIndicator,
  },
  {
    name: "user-list-avatars",
    title: "User List Avatars",
    description: "Accordion content for user collections with avatars.",
    component: AccordionUserListAvatars,
  },
] as const satisfies readonly ComposeRenderablePatternSpec[];

export type AccordionPatternName =
  (typeof accordionPatternCatalog)[number]["name"];

export const accordionPatternCount = accordionPatternCatalog.length;
export const accordionPatternNames = accordionPatternCatalog.map(
  (pattern) => pattern.name,
) as AccordionPatternName[];
