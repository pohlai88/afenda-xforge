"use client";

import { useCallback, useMemo, useState } from "react";
import type { WorkspaceNavTeam } from "./5.4-workspace-rail.types.ts";
import type { WorkspaceNavContextSwitcherProps } from "./5.7-workspace-nav-context-switcher.tsx";
import type { WorkspaceDemoSelection } from "./7.5-workspace.demo-seed.adapter.ts";
import {
  getWorkspaceDemoDefaultSelection,
  resolveWorkspaceDemoSwitchers,
  resolveWorkspaceDemoTeam,
  resolveWorkspaceDemoTeams,
  selectWorkspaceDemoDepartment,
  selectWorkspaceDemoOrganization,
  selectWorkspaceDemoProject,
  selectWorkspaceDemoTeam,
} from "./7.5-workspace.demo-seed.adapter.ts";

export type WorkspaceDemoLinkedNav = {
  activeTeam: WorkspaceNavTeam | undefined;
  selectDepartment: (departmentId: string) => void;
  selectOrganization: (organizationId: string) => void;
  selectProject: (projectId: string) => void;
  selectTeam: (teamId: string) => void;
  selection: WorkspaceDemoSelection;
  switchers: readonly WorkspaceNavContextSwitcherProps[];
  teams: readonly WorkspaceNavTeam[];
};

export function useWorkspaceDemoLinkedNav(
  initialSelection: WorkspaceDemoSelection = getWorkspaceDemoDefaultSelection(),
): WorkspaceDemoLinkedNav {
  const [selection, setSelection] = useState(initialSelection);

  const teams = useMemo(
    () =>
      resolveWorkspaceDemoTeams(
        selection.organizationId,
        selection.departmentId,
      ),
    [selection.departmentId, selection.organizationId],
  );

  const activeTeam = useMemo(
    () =>
      resolveWorkspaceDemoTeam(
        selection.organizationId,
        selection.departmentId,
        selection.teamId,
      ),
    [selection.departmentId, selection.organizationId, selection.teamId],
  );

  const onOrganizationChange = useCallback((organizationId: string) => {
    setSelection((current) =>
      selectWorkspaceDemoOrganization(organizationId, current),
    );
  }, []);

  const onDepartmentChange = useCallback((departmentId: string) => {
    setSelection((current) =>
      selectWorkspaceDemoDepartment(
        current.organizationId,
        departmentId,
        current,
      ),
    );
  }, []);

  const onTeamChange = useCallback((teamId: string) => {
    setSelection((current) =>
      selectWorkspaceDemoTeam(
        current.organizationId,
        current.departmentId,
        teamId,
        current,
      ),
    );
  }, []);

  const onProjectChange = useCallback((projectId: string) => {
    setSelection((current) =>
      selectWorkspaceDemoProject(
        current.organizationId,
        current.departmentId,
        current.teamId,
        projectId,
      ),
    );
  }, []);

  const switchers = useMemo(
    () =>
      resolveWorkspaceDemoSwitchers(selection, {
        onDepartmentChange,
        onOrganizationChange,
        onProjectChange,
        onTeamChange,
      }),
    [
      onDepartmentChange,
      onOrganizationChange,
      onProjectChange,
      onTeamChange,
      selection,
    ],
  );

  return {
    activeTeam,
    selectDepartment: onDepartmentChange,
    selectOrganization: onOrganizationChange,
    selectProject: onProjectChange,
    selectTeam: onTeamChange,
    selection,
    switchers,
    teams,
  };
}
