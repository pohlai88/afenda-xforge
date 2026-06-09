"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../ui-shadcn/card";

import { Accordion, AccordionSection } from "./accordion.shared";

export function AccordionBasicSingleExpand() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Basic single-expand accordion</CardTitle>
        <CardDescription>
          One open panel at a time for simple FAQ and help content.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          <AccordionSection title="Is it accessible?">
            Yes. It follows the expected disclosure interaction model and keeps
            the trigger keyboard friendly.
          </AccordionSection>
          <AccordionSection title="Is it styled?">
            Yes. It uses the package tokens and shared surface classes so it
            stays consistent with the rest of the UI kit.
          </AccordionSection>
          <AccordionSection title="Is it animated?">
            Yes. Panel height transitions are applied on open and close.
          </AccordionSection>
        </Accordion>
      </CardContent>
    </Card>
  );
}
