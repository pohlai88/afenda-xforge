"use client";

import type { ReactElement } from "react";
import type { WorkspaceNavTeam } from "./5.4-workspace-rail.types.ts";
import type { WorkspaceNavContextSwitcherProps } from "./5.7-workspace-nav-context-switcher.tsx";
import { WorkspaceNavContextSwitcher } from "./5.7-workspace-nav-context-switcher.tsx";

export type WorkspaceNavTeamSwitcherProps = {
  activeTeamId?: string;
  addTeamLabel?: string;
  defaultTeamId?: string;
  menuLabel?: string;
  onAddTeam?: () => void;
  onTeamChange?: (team: WorkspaceNavTeam) => void;
  showShortcuts?: boolean;
  teams: readonly WorkspaceNavTeam[];
};

export function WorkspaceNavTeamSwitcher({
  activeTeamId,
  addTeamLabel = "Add team",
  defaultTeamId,
  menuLabel,
  onAddTeam,
  onTeamChange,
  showShortcuts,
  teams,
}: WorkspaceNavTeamSwitcherProps): ReactElement | null {
  const props: WorkspaceNavContextSwitcherProps = {
    activeOptionId: activeTeamId,
    addOptionLabel: addTeamLabel,
    defaultOptionId: defaultTeamId,
    menuLabel,
    onAddOption: onAddTeam,
    onOptionChange: (option) => {
      onTeamChange?.({
        ...option,
        plan: option.subtitle,
      });
    },
    options: teams.map((team) => ({
      id: team.id,
      logo: team.logo,
      name: team.name,
      subtitle: team.plan,
    })),
    scope: "team",
    showShortcuts,
  };

  return <WorkspaceNavContextSwitcher {...props} />;
}

export type { WorkspaceNavTeam };
