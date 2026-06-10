"use client";

import { skeletonPatternCatalog } from "./skeleton.catalog";

export function SkeletonComposeGallery() {
  return (
    <div className="grid gap-6">
      {skeletonPatternCatalog.map(({ name, component: Component }) => (
        <Component key={name} />
      ))}
    </div>
  );
}
