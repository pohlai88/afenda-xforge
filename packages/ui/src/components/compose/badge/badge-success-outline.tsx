"use client";

import { BadgePatternCard, OutlineStatusBadge } from "./badge.shared";

export function BadgeSuccessOutline() {
  return (
    <BadgePatternCard title="Success outline badge">
      <OutlineStatusBadge tone="success">Success</OutlineStatusBadge>
    </BadgePatternCard>
  );
}
