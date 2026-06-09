"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../ui-shadcn/card";

import { Accordion, AccordionSection } from "./accordion.shared";

export function AccordionEmbeddedInCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Accordion embedded within a Card</CardTitle>
        <CardDescription>
          Useful when the accordion is the primary content surface.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Card className="border-dashed">
          <CardContent className="pt-6">
            <Accordion type="single" collapsible className="w-full">
              <AccordionSection title="Can I access my account history?">
                Yes. You can review transactions, plan changes, and support
                history from the account timeline.
              </AccordionSection>
              <AccordionSection title="Premium feature information (Locked)">
                This feature is available on higher tiers and is currently
                locked for the active plan.
              </AccordionSection>
              <AccordionSection title="How do I update my email address?">
                Open settings, go to profile details, and confirm the change
                with your current password.
              </AccordionSection>
            </Accordion>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
}
