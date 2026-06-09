"use client";

import { Avatar, AvatarFallback } from "../../ui-shadcn/avatar";
import { Badge } from "../../ui-shadcn/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui-shadcn/card";

import { Accordion, AccordionSection } from "./accordion.shared";

export function AccordionNestedBorderedItems() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Nested accordion example with bordered items</CardTitle>
      </CardHeader>
      <CardContent>
        <Accordion
          type="single"
          collapsible
          className="w-full rounded-xl border"
        >
          <AccordionSection
            title="Team members"
            triggerClassName="px-4"
            contentClassName="px-4"
          >
            <Accordion type="single" collapsible className="w-full">
              <AccordionSection
                title="Alex Johnson"
                badge={<Badge variant="outline">Admin</Badge>}
                icon={
                  <Avatar className="size-6">
                    <AvatarFallback>AJ</AvatarFallback>
                  </Avatar>
                }
              >
                Alex has full administrative access, including billing, user
                provisioning, and security configuration.
              </AccordionSection>
              <AccordionSection
                title="Sarah Chen"
                badge={<Badge variant="secondary">Viewer</Badge>}
                icon={
                  <Avatar className="size-6">
                    <AvatarFallback>SC</AvatarFallback>
                  </Avatar>
                }
              >
                Sarah can review content and monitor the account without
                modifying access or settings.
              </AccordionSection>
              <AccordionSection
                title="Michael Rodriguez"
                badge={<Badge>Editor</Badge>}
                icon={
                  <Avatar className="size-6">
                    <AvatarFallback>MR</AvatarFallback>
                  </Avatar>
                }
              >
                Michael can update shared content and coordinate operational
                changes.
              </AccordionSection>
            </Accordion>
          </AccordionSection>
        </Accordion>
      </CardContent>
    </Card>
  );
}
