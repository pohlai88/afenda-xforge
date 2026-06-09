"use client";

import { CheckIcon } from "lucide-react";

import { Badge, BadgePatternCard } from "./badge.shared";

export function BadgeWithIcon() {
  return (
    <BadgePatternCard title="Badge with icon">
      <Badge className="gap-1.5" variant="outline">
        <CheckIcon />
        Verified
      </Badge>
    </BadgePatternCard>
  );
}
