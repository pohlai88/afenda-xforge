"use client";

import { collapsiblePatternCatalog } from "./collapsible.catalog";

export function CollapsibleComposeGallery() {
  return (
    <div className="grid gap-6">
      {collapsiblePatternCatalog.map(({ name, component: Component }) => (
        <Component key={name} />
      ))}
    </div>
  );
}
