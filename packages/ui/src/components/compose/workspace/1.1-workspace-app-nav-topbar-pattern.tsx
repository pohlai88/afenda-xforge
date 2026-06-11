"use client";

import { WorkspaceAppNavTopbar } from "./1.0-workspace-app-nav-topbar.tsx";
import { WorkspaceShellProvider } from "./6.0-workspace-shell-provider.tsx";
import { useWorkspaceDemoLinkedNav } from "./7.6-workspace.demo-linked-nav.ts";
import { WorkspacePatternCard } from "./7.3-workspace-pattern.shared.tsx";

export function WorkspaceAppNavTopbarPattern() {
  const { switchers } = useWorkspaceDemoLinkedNav();

  return (
    <WorkspacePatternCard
      description="Organization ÔåÆ department ÔåÆ team ÔåÆ project switchers driven by 7.4-workspace.demo-seed.json. Each parent change resets linked children."
      title="App nav topbar (1.0)"
    >
      <div className="overflow-hidden rounded-lg border">
        <WorkspaceShellProvider>
          <WorkspaceAppNavTopbar switchers={switchers} />
        </WorkspaceShellProvider>
      </div>
    </WorkspacePatternCard>
  );
}
