"use client";

import { BadgePatternCard, OutlineStatusBadge } from "./badge.shared";

export function BadgeWarningOutline() {
  return (
    <BadgePatternCard title="Warning outline badge">
      <OutlineStatusBadge tone="warning">Warning</OutlineStatusBadge>
    </BadgePatternCard>
  );
}
