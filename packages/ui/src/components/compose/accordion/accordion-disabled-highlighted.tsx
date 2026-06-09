"use client";

import { ChevronRight, Lock, ShieldCheck } from "lucide-react";

import { Badge } from "../../ui-shadcn/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui-shadcn/card";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionSection,
  AccordionTriggerShell,
} from "./accordion.shared";

export function AccordionDisabledHighlighted() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Accordion with disabled items and highlighted state
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          <AccordionSection
            title="Account settings"
            badge={<Badge variant="secondary">New</Badge>}
            icon={<ShieldCheck className="size-4" />}
          >
            Manage preferences, security settings, and two-factor authentication
            from one place.
          </AccordionSection>
          <AccordionSection
            title="Privacy & security"
            icon={<Lock className="size-4" />}
            triggerClassName="data-[state=open]:bg-muted/60"
          >
            Control sessions, device access, and the security posture of the
            account.
          </AccordionSection>
          <AccordionItem disabled>
            <AccordionTriggerShell
              className="text-muted-foreground"
              indicator={
                <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
              }
            >
              Help & support
            </AccordionTriggerShell>
            <AccordionContent>
              This item is disabled to demonstrate the inactive state and
              prevent expansion.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
}
