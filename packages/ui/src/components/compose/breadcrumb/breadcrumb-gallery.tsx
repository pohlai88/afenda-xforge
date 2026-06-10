"use client";

import { breadcrumbPatternCatalog } from "./breadcrumb.catalog";

export function BreadcrumbComposeGallery() {
  return (
    <div className="grid gap-6">
      {breadcrumbPatternCatalog.map(({ name, component: Component }) => (
        <Component key={name} />
      ))}
    </div>
  );
}
