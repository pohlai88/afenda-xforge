"use client";

import { sheetPatternCatalog } from "./sheet.catalog";

export function SheetComposeGallery() {
  return (
    <div className="grid gap-6">
      {sheetPatternCatalog.map(({ name, component: Component }) => (
        <Component key={name} />
      ))}
    </div>
  );
}
