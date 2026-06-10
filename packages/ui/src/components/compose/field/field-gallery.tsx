"use client";

import { fieldPatternCatalog } from "./field.catalog";

export function FieldComposeGallery() {
  return (
    <div className="grid gap-6">
      {fieldPatternCatalog.map(({ name, component: Component }) => (
        <Component key={name} />
      ))}
    </div>
  );
}
