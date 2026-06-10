"use client";

import { tabsPatternCatalog } from "./tabs.catalog";

export function TabsComposeGallery() {
  return (
    <div className="grid gap-6">
      {tabsPatternCatalog.map(({ name, component: Component }) => (
        <Component key={name} />
      ))}
    </div>
  );
}
