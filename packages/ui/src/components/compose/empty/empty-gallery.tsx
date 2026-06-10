"use client";

import { emptyPatternCatalog } from "./empty.catalog";

export function EmptyComposeGallery() {
  return (
    <div className="grid gap-6">
      {emptyPatternCatalog.map(({ name, component: Component }) => (
        <Component key={name} />
      ))}
    </div>
  );
}
