"use client";

import { ratingPatternCatalog } from "./rating.catalog";

export function RatingComposeGallery() {
  return (
    <div className="grid gap-6">
      {ratingPatternCatalog.map(({ name, component: Component }) => (
        <Component key={name} />
      ))}
    </div>
  );
}
