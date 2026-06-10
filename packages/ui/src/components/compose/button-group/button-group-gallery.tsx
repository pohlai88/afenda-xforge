"use client";

import { buttonGroupPatternCatalog } from "./button-group.catalog";

export function ButtonGroupComposeGallery() {
  return (
    <div className="grid gap-6">
      {buttonGroupPatternCatalog.map(({ name, component: Component }) => (
        <Component key={name} />
      ))}
    </div>
  );
}
