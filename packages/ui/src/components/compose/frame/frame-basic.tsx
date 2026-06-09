"use client";

import { ArrowRight } from "lucide-react";

import { Button } from "../../ui-shadcn/button";
import {
  Frame,
  FrameDescription,
  FrameFooter,
  FrameHeader,
  FramePanel,
  FrameTitle,
} from "./frame.shared";

export function FrameBasic() {
  return (
    <Frame>
      <FramePanel>
        <FrameHeader>
          <FrameTitle>Frame Title</FrameTitle>
          <FrameDescription>Frame Description</FrameDescription>
        </FrameHeader>
        <div className="p-5 text-sm text-muted-foreground">Frame Content</div>
        <FrameFooter>
          <span className="text-sm text-muted-foreground">
            Updated just now
          </span>
          <Button size="sm">
            Continue
            <ArrowRight data-icon="inline-end" />
          </Button>
        </FrameFooter>
      </FramePanel>
    </Frame>
  );
}
