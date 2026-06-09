"use client";

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

export function AccordionComposeGallery() {
  return (
    <div className="grid gap-6">
      <AccordionBasicSingleExpand />
      <AccordionPlusMinusIndicators />
      <AccordionBordersRounded />
      <AccordionEmbeddedInCard />
      <AccordionDisabledHighlighted />
      <AccordionCustomIconsBadges />
      <AccordionFramePanels />
      <AccordionNestedBorderedItems />
      <AccordionUserListAvatars />
      <AccordionRotatingArrowIndicator />
      <AccordionOnboardingSetupSteps />
    </div>
  );
}
