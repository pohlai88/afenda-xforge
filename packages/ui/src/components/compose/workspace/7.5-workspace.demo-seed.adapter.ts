import {
  Briefcase,
  Building2,
  FolderKanban,
  LayoutDashboard,
  Users,
} from "lucide-react";
import type { ElementType } from "react";
import type { WorkspaceNavUserProfile } from "./4.0-workspace-nav-user.tsx";
import type { WorkspaceNavTeam } from "./5.4-workspace-rail.types.ts";
import type { WorkspaceNavContextSwitcherProps } from "./5.7-workspace-nav-context-switcher.tsx";
import seed from "./7.4-workspace.demo-seed.json";

export type WorkspaceDemoIconId =
  | "briefcase"
  | "building-2"
  | "folder-kanban"
  | "layout-dashboard"
  | "users";

export type WorkspaceDemoProjectSeed = {
  icon: WorkspaceDemoIconId;
  id: string;
  name: string;
  subtitle: string;
};

export type WorkspaceDemoTeamSeed = {
  icon: WorkspaceDemoIconId;
  id: string;
  name: string;
  plan: string;
  projects: WorkspaceDemoProjectSeed[];
  subtitle: string;
};

export type WorkspaceDemoDepartmentSeed = {
  icon: WorkspaceDemoIconId;
  id: string;
  name: string;
  subtitle: string;
  teams: WorkspaceDemoTeamSeed[];
};

export type WorkspaceDemoOrganizationSeed = {
  departments: WorkspaceDemoDepartmentSeed[];
  icon: WorkspaceDemoIconId;
  id: string;
  name: string;
  subtitle: string;
};

export type WorkspaceDemoNavItemSeed = {
  active?: boolean;
  id: string;
  label: string;
};

export type WorkspaceDemoSeed = {
  navigation: {
    features: WorkspaceDemoNavItemSeed[];
    modules: WorkspaceDemoNavItemSeed[];
  };
  organizations: WorkspaceDemoOrganizationSeed[];
  selection: WorkspaceDemoSelection;
  user: WorkspaceNavUserProfile;
  version: number;
};

export type WorkspaceDemoSelection = {
  departmentId: string;
  organizationId: string;
  projectId: string;
  teamId: string;
};

const DEMO_ICON_MAP: Record<
  WorkspaceDemoIconId,
  ElementType<{ className?: string }>
> = {
  briefcase: Briefcase,
  "building-2": Building2,
  "folder-kanban": FolderKanban,
  "layout-dashboard": LayoutDashboard,
  users: Users,
};

export const workspaceDemoSeed = seed as WorkspaceDemoSeed;

export function getWorkspaceDemoDefaultSelection(): WorkspaceDemoSelection {
  return { ...workspaceDemoSeed.selection };
}

export function getWorkspaceDemoUser(): WorkspaceNavUserProfile {
  return workspaceDemoSeed.user;
}

export function getWorkspaceDemoNavModules(): readonly WorkspaceDemoNavItemSeed[] {
  return workspaceDemoSeed.navigation.modules;
}

export function getWorkspaceDemoNavFeatures(): readonly WorkspaceDemoNavItemSeed[] {
  return workspaceDemoSeed.navigation.features;
}

function findOrganization(
  organizationId: string,
): WorkspaceDemoOrganizationSeed | undefined {
  return workspaceDemoSeed.organizations.find(
    (organization) => organization.id === organizationId,
  );
}

function findDepartment(
  organizationId: string,
  departmentId: string,
): WorkspaceDemoDepartmentSeed | undefined {
  return findOrganization(organizationId)?.departments.find(
    (department) => department.id === departmentId,
  );
}

function findTeam(
  organizationId: string,
  departmentId: string,
  teamId: string,
): WorkspaceDemoTeamSeed | undefined {
  return findDepartment(organizationId, departmentId)?.teams.find(
    (team) => team.id === teamId,
  );
}

function findProject(
  organizationId: string,
  departmentId: string,
  teamId: string,
  projectId: string,
): WorkspaceDemoProjectSeed | undefined {
  return findTeam(organizationId, departmentId, teamId)?.projects.find(
    (project) => project.id === projectId,
  );
}

function firstLinkedSelection(
  organization: WorkspaceDemoOrganizationSeed,
): WorkspaceDemoSelection {
  const department = organization.departments[0];
  const team = department?.teams[0];
  const project = team?.projects[0];

  return {
    organizationId: organization.id,
    departmentId: department?.id ?? "",
    teamId: team?.id ?? "",
    projectId: project?.id ?? "",
  };
}

export function resolveWorkspaceDemoIcon(
  iconId: WorkspaceDemoIconId,
): ElementType<{ className?: string }> {
  return DEMO_ICON_MAP[iconId];
}

export function resolveWorkspaceDemoTeams(
  organizationId: string,
  departmentId: string,
): readonly WorkspaceNavTeam[] {
  const department = findDepartment(organizationId, departmentId);

  if (!department) {
    return [];
  }

  return department.teams.map((team) => ({
    id: team.id,
    logo: resolveWorkspaceDemoIcon(team.icon),
    name: team.name,
    plan: team.plan,
  }));
}

export function resolveWorkspaceDemoTeam(
  organizationId: string,
  departmentId: string,
  teamId: string,
): WorkspaceNavTeam | undefined {
  const team = findTeam(organizationId, departmentId, teamId);

  if (!team) {
    return undefined;
  }

  return {
    id: team.id,
    logo: resolveWorkspaceDemoIcon(team.icon),
    name: team.name,
    plan: team.plan,
  };
}

export type WorkspaceDemoSelectionHandlers = {
  onDepartmentChange: (departmentId: string) => void;
  onOrganizationChange: (organizationId: string) => void;
  onProjectChange: (projectId: string) => void;
  onTeamChange: (teamId: string) => void;
};

export function resolveWorkspaceDemoSwitchers(
  selection: WorkspaceDemoSelection,
  handlers: WorkspaceDemoSelectionHandlers,
): readonly WorkspaceNavContextSwitcherProps[] {
  const organization = findOrganization(selection.organizationId);
  const department = findDepartment(
    selection.organizationId,
    selection.departmentId,
  );
  const team = findTeam(
    selection.organizationId,
    selection.departmentId,
    selection.teamId,
  );

  if (!organization || !department || !team) {
    return [];
  }

  return [
    {
      activeOptionId: selection.organizationId,
      onOptionChange: (option) => {
        handlers.onOrganizationChange(option.id);
      },
      options: workspaceDemoSeed.organizations.map((entry) => ({
        id: entry.id,
        logo: resolveWorkspaceDemoIcon(entry.icon),
        name: entry.name,
        subtitle: entry.subtitle,
      })),
      scope: "organization",
    },
    {
      activeOptionId: selection.departmentId,
      onOptionChange: (option) => {
        handlers.onDepartmentChange(option.id);
      },
      options: organization.departments.map((entry) => ({
        id: entry.id,
        logo: resolveWorkspaceDemoIcon(entry.icon),
        name: entry.name,
        subtitle: entry.subtitle,
      })),
      scope: "department",
    },
    {
      activeOptionId: selection.teamId,
      onOptionChange: (option) => {
        handlers.onTeamChange(option.id);
      },
      options: department.teams.map((entry) => ({
        id: entry.id,
        logo: resolveWorkspaceDemoIcon(entry.icon),
        name: entry.name,
        subtitle: entry.subtitle,
      })),
      scope: "team",
    },
    {
      activeOptionId: selection.projectId,
      onOptionChange: (option) => {
        handlers.onProjectChange(option.id);
      },
      options: team.projects.map((entry) => ({
        id: entry.id,
        logo: resolveWorkspaceDemoIcon(entry.icon),
        name: entry.name,
        subtitle: entry.subtitle,
      })),
      scope: "project",
    },
  ];
}

export function selectWorkspaceDemoOrganization(
  organizationId: string,
  current: WorkspaceDemoSelection = getWorkspaceDemoDefaultSelection(),
): WorkspaceDemoSelection {
  const organization = findOrganization(organizationId);

  if (!organization) {
    return current;
  }

  return firstLinkedSelection(organization);
}

export function selectWorkspaceDemoDepartment(
  organizationId: string,
  departmentId: string,
  current: WorkspaceDemoSelection = getWorkspaceDemoDefaultSelection(),
): WorkspaceDemoSelection {
  const department = findDepartment(organizationId, departmentId);

  if (!department) {
    return current;
  }

  const team = department.teams[0];
  const project = team?.projects[0];

  return {
    organizationId,
    departmentId,
    teamId: team?.id ?? current.teamId,
    projectId: project?.id ?? current.projectId,
  };
}

export function selectWorkspaceDemoTeam(
  organizationId: string,
  departmentId: string,
  teamId: string,
  current: WorkspaceDemoSelection = getWorkspaceDemoDefaultSelection(),
): WorkspaceDemoSelection {
  const team = findTeam(organizationId, departmentId, teamId);

  if (!team) {
    return current;
  }

  const project = team.projects[0];

  return {
    organizationId,
    departmentId,
    teamId,
    projectId: project?.id ?? current.projectId,
  };
}

export function selectWorkspaceDemoProject(
  organizationId: string,
  departmentId: string,
  teamId: string,
  projectId: string,
): WorkspaceDemoSelection {
  const project = findProject(organizationId, departmentId, teamId, projectId);

  if (!project) {
    return selectWorkspaceDemoTeam(organizationId, departmentId, teamId);
  }

  return { organizationId, departmentId, teamId, projectId };
}

export function getWorkspaceDemoSwitchersSnapshot(): readonly WorkspaceNavContextSwitcherProps[] {
  const selection = getWorkspaceDemoDefaultSelection();

  return resolveWorkspaceDemoSwitchers(selection, {
    onDepartmentChange: () => undefined,
    onOrganizationChange: () => undefined,
    onProjectChange: () => undefined,
    onTeamChange: () => undefined,
  });
}

export function getWorkspaceDemoTeamsSnapshot(): readonly WorkspaceNavTeam[] {
  const selection = getWorkspaceDemoDefaultSelection();

  return resolveWorkspaceDemoTeams(
    selection.organizationId,
    selection.departmentId,
  );
}
