"use client";

import { Card, CardContent, CardHeader, CardTitle } from "../../ui-shadcn/card";

import { Accordion, Frame, FramePanel } from "./accordion.shared";

export function AccordionFramePanels() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Accordion items integrated within Frame and FramePanel
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Frame>
          <CardContent className="pt-4">
            <Accordion type="single" collapsible className="w-full">
              <FramePanel
                title="Product overview"
                body="A compact summary of the product, the audience, and the primary workflow."
              />
              <FramePanel
                title="Additional details"
                body="Metadata, assumptions, and supporting context that should stay nearby."
              />
              <FramePanel
                title="Technical specifications"
                body="Detailed specs including dimensions, weight, compatibility, and power requirements."
              />
            </Accordion>
          </CardContent>
        </Frame>
      </CardContent>
    </Card>
  );
}
