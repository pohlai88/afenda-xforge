"use client";

import { WorkspaceNavContextSwitcherStack } from "./5.5-workspace-nav-context-switcher-stack.tsx";
import { WorkspaceNavTeamSwitcher } from "./5.2-workspace-nav-team-switcher.tsx";
import { WorkspaceShellProvider } from "./6.0-workspace-shell-provider.tsx";
import { useWorkspaceDemoLinkedNav } from "./7.6-workspace.demo-linked-nav.ts";
import { WorkspacePatternCard } from "./7.3-workspace-pattern.shared.tsx";

export function WorkspaceContextSwitchersPattern() {
  const { activeTeam, selectTeam, selection, switchers, teams } =
    useWorkspaceDemoLinkedNav();

  return (
    <WorkspacePatternCard
      description="Linked demo seed: 5.2 team switcher and 5.5 stack (5.0 org → 5.1 dept → 5.2 team → 5.3 proj) from 7.4-workspace.demo-seed.json."
      title="Context switchers (5.x)"
    >
      <p className="mb-4 text-muted-foreground text-xs">
        Active path: {selection.organizationId} / {selection.departmentId} /{" "}
        {selection.teamId} / {selection.projectId}
      </p>
      <div className="grid gap-6 md:grid-cols-2">
        <div className="overflow-hidden rounded-lg border p-3">
          <WorkspaceShellProvider>
            <WorkspaceNavTeamSwitcher
              activeTeamId={selection.teamId}
              onTeamChange={(team) => {
                selectTeam(team.id);
              }}
              teams={teams}
            />
          </WorkspaceShellProvider>
        </div>
        <div className="overflow-hidden rounded-lg border p-3">
          <WorkspaceShellProvider>
            <WorkspaceNavContextSwitcherStack switchers={switchers} />
          </WorkspaceShellProvider>
        </div>
      </div>
      {activeTeam ? (
        <p className="mt-4 text-muted-foreground text-xs">
          Resolved team: {activeTeam.name} ({activeTeam.plan})
        </p>
      ) : null}
    </WorkspacePatternCard>
  );
}
