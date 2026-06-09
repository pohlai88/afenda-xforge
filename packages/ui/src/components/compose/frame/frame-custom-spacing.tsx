"use client";

import { Button } from "../../ui-shadcn/button";
import {
  Frame,
  FrameDescription,
  FrameHeader,
  FramePanel,
  FrameTitle,
} from "./frame.shared";

export function FrameCustomSpacing() {
  return (
    <Frame spacing="lg">
      <FramePanel>
        <FrameHeader>
          <FrameTitle>Custom Spacing</FrameTitle>
          <FrameDescription>
            More breathing room between panels.
          </FrameDescription>
        </FrameHeader>
        <div className="p-5 text-sm text-muted-foreground">
          Increasing spacing gives the frame a more editorial feel.
        </div>
      </FramePanel>

      <FramePanel>
        <FrameHeader>
          <FrameTitle>Secondary Panel</FrameTitle>
          <FrameDescription>
            Used to show the larger inter-panel gap.
          </FrameDescription>
        </FrameHeader>
        <div className="p-5">
          <Button variant="outline" size="sm">
            Action
          </Button>
        </div>
      </FramePanel>
    </Frame>
  );
}
