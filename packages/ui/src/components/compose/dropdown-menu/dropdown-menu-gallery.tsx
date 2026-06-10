"use client";

import { dropdownMenuPatternCatalog } from "./dropdown-menu.catalog";

export function DropdownMenuComposeGallery() {
  return (
    <div className="grid gap-6">
      {dropdownMenuPatternCatalog.map(({ name, component: Component }) => (
        <Component key={name} />
      ))}
    </div>
  );
}
