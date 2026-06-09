"use client";

import { CircleHelp, ShieldCheck, Sparkles } from "lucide-react";

import { Badge } from "../../ui-shadcn/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui-shadcn/card";

import { Accordion, AccordionSection } from "./accordion.shared";

export function AccordionCustomIconsBadges() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Advanced accordion with custom icons and badges</CardTitle>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          <AccordionSection
            title="Account settings"
            badge={<Badge variant="secondary">New</Badge>}
            icon={<Sparkles className="size-4" />}
          >
            Manage preferences, security settings, and personal information.
          </AccordionSection>
          <AccordionSection
            title="Privacy & security"
            badge={<Badge variant="outline">Updated</Badge>}
            icon={<ShieldCheck className="size-4" />}
          >
            Review sessions, trusted devices, and security options.
          </AccordionSection>
          <AccordionSection
            title="Help & support"
            badge={<Badge variant="secondary">24/7</Badge>}
            icon={<CircleHelp className="size-4" />}
          >
            Reach docs, support tickets, and onboarding resources quickly.
          </AccordionSection>
        </Accordion>
      </CardContent>
    </Card>
  );
}
