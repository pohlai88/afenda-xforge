"use client";

import { dateSelectorPatternCatalog } from "./date-selector.catalog";

export function DateSelectorComposeGallery() {
  return (
    <div className="grid gap-6">
      {dateSelectorPatternCatalog.map(({ name, component: Component }) => (
        <Component key={name} />
      ))}
    </div>
  );
}
