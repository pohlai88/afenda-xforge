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

export function FrameDensePanels() {
  return (
    <Frame dense spacing="sm">
      <FramePanel>
        <FrameHeader>
          <FrameTitle>Dense Layout</FrameTitle>
          <FrameDescription>
            Reduced padding for compact dashboards.
          </FrameDescription>
        </FrameHeader>
        <div className="p-4 text-sm text-muted-foreground">
          Dense frames keep content close together while still retaining the
          panel hierarchy.
        </div>
        <FrameFooter>
          <span className="text-xs text-muted-foreground">Compact</span>
          <Button variant="outline" size="xs">
            Open
          </Button>
        </FrameFooter>
      </FramePanel>
    </Frame>
  );
}
