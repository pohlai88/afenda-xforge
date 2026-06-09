"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../ui-shadcn/card";

import { Accordion, AccordionSection } from "./accordion.shared";

export function AccordionBordersRounded() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Accordion with borders and rounded corners</CardTitle>
        <CardDescription>
          Container padding and rounded panels for denser layouts.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Accordion
          type="single"
          collapsible
          className="w-full rounded-xl border"
        >
          <AccordionSection
            title="Subscription & billing"
            triggerClassName="px-4"
            contentClassName="px-4"
          >
            Annual billing is available with a discount, and all plans include a
            free trial without a card requirement.
          </AccordionSection>
          <AccordionSection
            title="How does billing work?"
            triggerClassName="px-4"
            contentClassName="px-4"
          >
            Charges are applied at the beginning of each cycle and your plan can
            be changed from the account settings page.
          </AccordionSection>
          <AccordionSection
            title="Is my data secure?"
            triggerClassName="px-4"
            contentClassName="px-4"
          >
            Sensitive data is protected with standard encryption and scoped
            access controls.
          </AccordionSection>
        </Accordion>
      </CardContent>
    </Card>
  );
}
