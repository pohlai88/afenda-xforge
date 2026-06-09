"use client";

import { XIcon } from "lucide-react";

import { Button } from "../../ui-shadcn/button";
import { Badge, BadgePatternCard } from "./badge.shared";

export function BadgeWithIconButton() {
  return (
    <BadgePatternCard title="Badge with icon button">
      <Badge className="gap-0.5 pr-1" variant="outline">
        Badge
        <Button
          aria-label="Remove badge"
          className="size-3 hover:bg-transparent"
          size="icon"
          variant="ghost"
        >
          <XIcon />
        </Button>
      </Badge>
    </BadgePatternCard>
  );
}
