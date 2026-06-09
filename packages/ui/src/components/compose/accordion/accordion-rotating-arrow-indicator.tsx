"use client";

import { ArrowRight, BadgeCheck, Package } from "lucide-react";

import { Badge } from "../../ui-shadcn/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui-shadcn/card";

import { Accordion, AccordionSection } from "./accordion.shared";

export function AccordionRotatingArrowIndicator() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Accordion with rotating arrow indicator</CardTitle>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          <AccordionSection
            title="Add products"
            badge={<Badge variant="secondary">Ready</Badge>}
            icon={<Package className="size-4" />}
          >
            Get the point-of-sale app configured, then scan the QR code or send
            the link to the team.
          </AccordionSection>
          <AccordionSection
            title="Product price & stock"
            icon={<ArrowRight className="size-4" />}
          >
            Track pricing and inventory in the same flow so the setup stays
            short and linear.
          </AccordionSection>
          <AccordionSection
            title="Product launch checklist"
            icon={<BadgeCheck className="size-4" />}
          >
            Review the required launch steps and confirm the final readiness
            status before publishing.
          </AccordionSection>
        </Accordion>
      </CardContent>
    </Card>
  );
}
