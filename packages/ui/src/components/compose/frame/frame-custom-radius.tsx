"use client";

import { Badge } from "../../ui-shadcn/badge";
import {
  Frame,
  FrameDescription,
  FrameHeader,
  FramePanel,
  FrameTitle,
} from "./frame.shared";

export function FrameCustomRadius() {
  return (
    <Frame className="[--frame-radius:var(--radius-lg)]">
      <FramePanel>
        <FrameHeader>
          <FrameTitle>Custom Radius</FrameTitle>
          <FrameDescription>
            Override the frame radius with a CSS variable.
          </FrameDescription>
        </FrameHeader>
        <div className="p-5 flex items-center gap-2">
          <Badge variant="secondary">--frame-radius</Badge>
          <Badge variant="outline">var(--radius-lg)</Badge>
        </div>
      </FramePanel>
    </Frame>
  );
}
