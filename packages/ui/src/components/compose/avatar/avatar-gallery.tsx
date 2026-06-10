"use client";

import { avatarPatternCatalog } from "./avatar.catalog";

export function AvatarComposeGallery() {
  return (
    <div className="grid gap-6">
      {avatarPatternCatalog.map(({ name, component: Component }) => (
        <Component key={name} />
      ))}
    </div>
  );
}
