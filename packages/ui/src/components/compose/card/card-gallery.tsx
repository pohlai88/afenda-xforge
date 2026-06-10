"use client";

import { cardPatternCatalog } from "./card.catalog";

export function CardComposeGallery() {
  return (
    <div className="grid gap-6">
      {cardPatternCatalog.map(({ name, component: Component }) => (
        <Component key={name} />
      ))}
    </div>
  );
}
