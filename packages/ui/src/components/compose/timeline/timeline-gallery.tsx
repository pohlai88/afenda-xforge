"use client";

import { timelinePatternCatalog } from "./timeline.catalog";

export function TimelineComposeGallery() {
  return (
    <div className="grid gap-6">
      {timelinePatternCatalog.map(({ name, component: Component }) => (
        <Component key={name} />
      ))}
    </div>
  );
}
