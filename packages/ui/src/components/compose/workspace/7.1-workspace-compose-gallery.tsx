"use client";

import { workspacePatternCatalog } from "./7.2-workspace-pattern.catalog";

export function WorkspaceComposeGallery() {
  return (
    <div className="grid gap-6">
      {workspacePatternCatalog.map(({ name, component: Component }) => (
        <Component key={name} />
      ))}
    </div>
  );
}
