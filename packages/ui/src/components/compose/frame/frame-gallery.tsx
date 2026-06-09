"use client";

import { framePatternCatalog } from "./frame.catalog";

export function FrameComposeGallery() {
  return (
    <div className="grid gap-6">
      {framePatternCatalog.map(({ name, component: Component }) => (
        <Component key={name} />
      ))}
    </div>
  );
}
