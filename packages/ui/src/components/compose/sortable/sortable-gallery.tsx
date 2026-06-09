"use client";

import { sortablePatternCatalog } from "./sortable.catalog";

export function SortableComposeGallery() {
  return (
    <div className="grid gap-6">
      {sortablePatternCatalog.map(({ name, component: Component }) => (
        <Component key={name} />
      ))}
    </div>
  );
}
