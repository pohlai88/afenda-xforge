"use client";

import { BadgePatternCard, OutlineStatusBadge } from "./badge.shared";

export function BadgeInfoOutline() {
  return (
    <BadgePatternCard title="Info outline badge">
      <OutlineStatusBadge tone="info">Info</OutlineStatusBadge>
    </BadgePatternCard>
  );
}
