"use client";

import { WorkspaceNavSiteContent } from "./3.0-workspace-site-nav-content.tsx";
import { WorkspaceSiteContent } from "./3.1-workspace-site-content.tsx";
import { WorkspaceNavSiteTopbar } from "./3.1-workspace-site-nav-topbar.tsx";
import { WorkspaceShellProvider } from "./6.0-workspace-shell-provider.tsx";
import { WorkspacePatternCard } from "./7.3-workspace-pattern.shared.tsx";

export function WorkspaceSiteChromePattern() {
  return (
    <WorkspacePatternCard
      description="Site topbar + scrollable content column inside SidebarInset."
      title="Site chrome (3.x)"
    >
      <div className="overflow-hidden rounded-lg border">
        <WorkspaceShellProvider className="h-[420px]">
          <WorkspaceNavSiteContent>
            <WorkspaceNavSiteTopbar scopeLabel="SITE" title="Stock levels" />
            <WorkspaceSiteContent padded>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-lg border p-4 text-sm">
                  Summary card
                </div>
                <div className="rounded-lg border p-4 text-sm">
                  Activity feed
                </div>
              </div>
            </WorkspaceSiteContent>
          </WorkspaceNavSiteContent>
        </WorkspaceShellProvider>
      </div>
    </WorkspacePatternCard>
  );
}
