"use client";

import { Button } from "../../ui-shadcn/button";
import {
  Frame,
  FrameDescription,
  FrameFooter,
  FrameHeader,
  FramePanel,
  FrameTitle,
} from "./frame.shared";

export function FrameStackedPanels() {
  return (
    <Frame stacked>
      <FramePanel>
        <FrameHeader>
          <FrameTitle>Stacked Top</FrameTitle>
          <FrameDescription>
            Panels join into one continuous surface.
          </FrameDescription>
        </FrameHeader>
        <div className="p-5 text-sm text-muted-foreground">
          The top panel keeps the main summary and status indicators.
        </div>
      </FramePanel>

      <FramePanel>
        <FrameHeader>
          <FrameTitle>Stacked Bottom</FrameTitle>
          <FrameDescription>Actions and secondary content.</FrameDescription>
        </FrameHeader>
        <FrameFooter>
          <span className="text-sm text-muted-foreground">Shared border</span>
          <Button size="sm">Review</Button>
        </FrameFooter>
      </FramePanel>
    </Frame>
  );
}
