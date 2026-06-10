"use client";

import { checkboxPatternCatalog } from "./checkbox.catalog";

export function CheckboxComposeGallery() {
  return (
    <div className="grid gap-6">
      {checkboxPatternCatalog.map(({ name, component: Component }) => (
        <Component key={name} />
      ))}
    </div>
  );
}
