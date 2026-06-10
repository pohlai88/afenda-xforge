"use client";

import { comboboxPatternCatalog } from "./combobox.catalog";

export function ComboboxComposeGallery() {
  return (
    <div className="grid gap-6">
      {comboboxPatternCatalog.map(({ name, component: Component }) => (
        <Component key={name} />
      ))}
    </div>
  );
}
