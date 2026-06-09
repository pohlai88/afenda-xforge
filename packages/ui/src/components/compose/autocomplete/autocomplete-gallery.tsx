"use client";

import { autocompletePatternCatalog } from "./autocomplete.catalog";

export function AutocompleteComposeGallery() {
  return (
    <div className="grid gap-6">
      {autocompletePatternCatalog.map(({ name, component: Component }) => (
        <Component key={name} />
      ))}
    </div>
  );
}
