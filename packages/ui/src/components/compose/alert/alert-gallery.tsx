"use client";

import { alertPatternCatalog } from "./alert.catalog";

export function AlertComposeGallery() {
  return (
    <div className="grid gap-6">
      {alertPatternCatalog.map(({ name, component: Component }) => (
        <Component key={name} />
      ))}
    </div>
  );
}
