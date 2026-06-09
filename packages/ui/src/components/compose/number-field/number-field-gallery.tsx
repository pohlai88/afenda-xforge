"use client";

import { numberFieldPatternCatalog } from "./number-field.catalog";

export function NumberFieldComposeGallery() {
  return (
    <div className="grid gap-6">
      {numberFieldPatternCatalog.map(({ name, component: Component }) => (
        <Component key={name} />
      ))}
    </div>
  );
}
