"use client";

import { spinnerPatternCatalog } from "./spinner.catalog";

export function SpinnerComposeGallery() {
  return (
    <div className="grid gap-6">
      {spinnerPatternCatalog.map(({ name, component: Component }) => (
        <Component key={name} />
      ))}
    </div>
  );
}
