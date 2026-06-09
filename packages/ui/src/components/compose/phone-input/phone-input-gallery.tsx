"use client";

import { phoneInputPatternCatalog } from "./phone-input.catalog";

export function PhoneInputComposeGallery() {
  return (
    <div className="grid gap-6">
      {phoneInputPatternCatalog.map(({ name, component: Component }) => (
        <Component key={name} />
      ))}
    </div>
  );
}
