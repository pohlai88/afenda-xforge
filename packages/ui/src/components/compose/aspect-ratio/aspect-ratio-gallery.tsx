"use client";

import { aspectRatioPatternCatalog } from "./aspect-ratio.catalog";

export function AspectRatioComposeGallery() {
  return (
    <div className="grid gap-6">
      {aspectRatioPatternCatalog.map(({ name, component: Component }) => (
        <Component key={name} />
      ))}
    </div>
  );
}
