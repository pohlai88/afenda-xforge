"use client";

import { ChevronRight } from "lucide-react";

import { Avatar, AvatarFallback } from "../../ui-shadcn/avatar";
import { Badge } from "../../ui-shadcn/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui-shadcn/card";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTriggerShell,
} from "./accordion.shared";

export function AccordionUserListAvatars() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          User list accordion with avatars and role indicators
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          {[
            {
              name: "Alex Johnson",
              role: "Admin",
              initials: "AJ",
              description:
                "Alex has full administrative access to the platform, including billing management and security settings.",
            },
            {
              name: "Sarah Chen",
              role: "Viewer",
              initials: "SC",
              description:
                "Sarah can review records, track changes, and follow team activity without editing permissions.",
            },
            {
              name: "Michael Rodriguez",
              role: "Editor",
              initials: "MR",
              description:
                "Michael can edit shared content and coordinate updates across operational workflows.",
            },
          ].map((person) => (
            <AccordionItem key={person.name}>
              <AccordionTriggerShell
                indicator={
                  <ChevronRight className="size-4 shrink-0 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-90" />
                }
              >
                <span className="flex min-w-0 flex-1 items-center gap-3">
                  <Avatar className="size-8">
                    <AvatarFallback>{person.initials}</AvatarFallback>
                  </Avatar>
                  <span className="min-w-0 truncate">{person.name}</span>
                </span>
                <Badge variant="outline" className="shrink-0">
                  {person.role}
                </Badge>
              </AccordionTriggerShell>
              <AccordionContent>{person.description}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
}
