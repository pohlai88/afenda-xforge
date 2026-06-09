"use client";

import { Badge } from "../../ui-shadcn/badge";
import { Button } from "../../ui-shadcn/button";
import {
  Frame,
  FrameDescription,
  FrameFooter,
  FrameHeader,
  FramePanel,
  FrameTitle,
} from "./frame.shared";

export function FrameSeparatedPanels() {
  return (
    <Frame>
      <FramePanel>
        <FrameHeader>
          <FrameTitle>Summary</FrameTitle>
          <FrameDescription>Top-level context and status.</FrameDescription>
        </FrameHeader>
        <div className="p-5 flex flex-wrap gap-2">
          <Badge variant="secondary">Live</Badge>
          <Badge variant="outline">APAC</Badge>
          <Badge variant="outline">Priority</Badge>
        </div>
        <FrameFooter>
          <span className="text-sm text-muted-foreground">3 labels</span>
          <Button variant="outline" size="sm">
            Edit
          </Button>
        </FrameFooter>
      </FramePanel>

      <FramePanel>
        <FrameHeader>
          <FrameTitle>Details</FrameTitle>
          <FrameDescription>
            Supporting content in a second panel.
          </FrameDescription>
        </FrameHeader>
        <div className="p-5 text-sm leading-6 text-muted-foreground">
          This layout keeps related sections together while preserving clear
          separation between summaries and details.
        </div>
      </FramePanel>
    </Frame>
  );
}
