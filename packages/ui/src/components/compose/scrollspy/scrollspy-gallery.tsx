"use client";

import { scrollspyPatternCatalog } from "./scrollspy.catalog";

export function ScrollspyComposeGallery() {
  return (
    <div className="grid gap-6">
      {scrollspyPatternCatalog.map(({ name, component: Component }) => (
        <Component key={name} />
      ))}
    </div>
  );
}
