"use client";

import { commandPatternCatalog } from "./command.catalog";

export function CommandComposeGallery() {
  return (
    <div className="grid gap-6">
      {commandPatternCatalog.map(({ name, component: Component }) => (
        <Component key={name} />
      ))}
    </div>
  );
}
