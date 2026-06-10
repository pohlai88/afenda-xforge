"use client";

import { buttonPatternCatalog } from "./button.catalog";

export function ButtonComposeGallery() {
  return (
    <div className="grid gap-6">
      {buttonPatternCatalog.map(({ name, component: Component }) => (
        <Component key={name} />
      ))}
    </div>
  );
}
