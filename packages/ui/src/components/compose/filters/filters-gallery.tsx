"use client";

import { filtersPatternCatalog } from "./filters.catalog";

export function FiltersComposeGallery() {
  return (
    <div className="grid gap-6">
      {filtersPatternCatalog.map(({ name, component: Component }) => (
        <Component key={name} />
      ))}
    </div>
  );
}
