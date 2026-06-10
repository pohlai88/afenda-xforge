"use client";

import { inputGroupPatternCatalog } from "./input-group.catalog";

export function InputGroupComposeGallery() {
  return (
    <div className="grid gap-6">
      {inputGroupPatternCatalog.map(({ name, component: Component }) => (
        <Component key={name} />
      ))}
    </div>
  );
}
