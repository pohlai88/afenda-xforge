"use client";

import { treePatternCatalog } from "./tree.catalog";

export function TreeComposeGallery() {
  return (
    <div className="grid gap-6">
      {treePatternCatalog.map(({ name, component: Component }) => (
        <Component key={name} />
      ))}
    </div>
  );
}
