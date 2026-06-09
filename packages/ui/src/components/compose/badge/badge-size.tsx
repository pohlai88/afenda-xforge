"use client";

import { Badge, BadgePatternCard } from "./badge.shared";

export function BadgeSize() {
  return (
    <BadgePatternCard
      description="Badge sizes from compact to spacious."
      title="Badge size"
    >
      <div className="flex flex-wrap items-center gap-2">
        <Badge size="xs">XS</Badge>
        <Badge size="sm">SM</Badge>
        <Badge size="default">Default</Badge>
        <Badge size="lg">LG</Badge>
        <Badge size="xl">XL</Badge>
      </div>
    </BadgePatternCard>
  );
}
