"use client";

import { badgePatternCatalog } from "./badge.catalog";

export function BadgeComposeGallery() {
  return (
    <div className="grid gap-6">
      {badgePatternCatalog.map(({ name, component: Component }) => (
        <Component key={name} />
      ))}
    </div>
  );
}
