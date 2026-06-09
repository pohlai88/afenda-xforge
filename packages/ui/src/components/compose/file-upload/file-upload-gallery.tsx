"use client";

import { fileUploadPatternCatalog } from "./file-upload.catalog";

export function FileUploadComposeGallery() {
  return (
    <div className="grid gap-6">
      {fileUploadPatternCatalog.map(({ name, component: Component }) => (
        <Component key={name} />
      ))}
    </div>
  );
}
