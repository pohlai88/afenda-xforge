"use client";

import { chartPatternCatalog } from "./chart.catalog";

export function ChartComposeGallery() {
  return (
    <div className="grid gap-6">
      {chartPatternCatalog.map(({ name, component: Component }) => (
        <Component key={name} />
      ))}
    </div>
  );
}
