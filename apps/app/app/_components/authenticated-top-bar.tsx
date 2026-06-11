"use client";

import { WorkspaceNavSiteTopbar } from "@repo/ui/components/compose/workspace";
import type { ReactElement } from "react";
import { PersistedModeToggle } from "./persisted-mode-toggle.tsx";

export function AuthenticatedTopBar(): ReactElement {
  return (
    <WorkspaceNavSiteTopbar
      actions={<PersistedModeToggle />}
      description="Authenticated workspace"
    />
  );
}
