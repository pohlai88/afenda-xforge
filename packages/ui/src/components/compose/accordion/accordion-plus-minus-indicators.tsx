"use client";

import { Minus, Plus } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "../../ui-shadcn/card";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTriggerShell,
} from "./accordion.shared";

export function AccordionPlusMinusIndicators() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Accordion with plus/minus indicators</CardTitle>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          {[
            {
              title: "How does billing work?",
              body: "Monthly and annual billing are available. You can switch plans from settings and cancel any time.",
            },
            {
              title: "Is my data secure?",
              body: "Data is encrypted at rest and in transit with standard platform controls for access and retention.",
            },
            {
              title: "What integrations do you support?",
              body: "Core workflow integrations, identity providers, and the API surface used by the app shell.",
            },
          ].map((item) => (
            <AccordionItem key={item.title}>
              <AccordionTriggerShell
                indicator={
                  <span className="relative size-4 shrink-0">
                    <Plus className="absolute inset-0 size-4 transition-opacity duration-200 group-data-[state=open]:opacity-0" />
                    <Minus className="absolute inset-0 size-4 opacity-0 transition-opacity duration-200 group-data-[state=open]:opacity-100" />
                  </span>
                }
              >
                {item.title}
              </AccordionTriggerShell>
              <AccordionContent>{item.body}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
}
