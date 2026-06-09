"use client";

import { Badge } from "../../ui-shadcn/badge";
import {
  Frame,
  FrameDescription,
  FrameHeader,
  FramePanel,
  FrameTitle,
} from "./frame.shared";

export function FrameWithoutOuterBorder() {
  return (
    <Frame variant="ghost">
      <FramePanel>
        <FrameHeader>
          <FrameTitle>Ghost Frame</FrameTitle>
          <FrameDescription>
            No outer shell, only the inner panel.
          </FrameDescription>
        </FrameHeader>
        <div className="p-5 flex items-center gap-2">
          <Badge variant="secondary">Minimal</Badge>
          <Badge variant="outline">No border</Badge>
        </div>
      </FramePanel>
    </Frame>
  );
}
