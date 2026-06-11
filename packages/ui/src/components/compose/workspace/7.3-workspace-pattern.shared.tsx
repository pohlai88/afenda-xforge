"use client";

import type { ReactNode } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../ui-shadcn/card";
import type { WorkspaceNavUserProfile } from "./4.0-workspace-nav-user.tsx";
import type { WorkspaceNavTeam } from "./5.4-workspace-rail.types.ts";
import type { WorkspaceNavContextSwitcherProps } from "./5.7-workspace-nav-context-switcher.tsx";
import {
  getWorkspaceDemoNavFeatures,
  getWorkspaceDemoNavModules,
  getWorkspaceDemoSwitchersSnapshot,
  getWorkspaceDemoTeamsSnapshot,
  getWorkspaceDemoUser,
} from "./7.5-workspace.demo-seed.adapter.ts";

export function WorkspacePatternCard({
  children,
  description,
  title,
}: {
  children: ReactNode;
  description?: string;
  title: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

/** @deprecated Prefer `useWorkspaceDemoLinkedNav()` for interactive demos. */
export const WORKSPACE_DEMO_USER: WorkspaceNavUserProfile =
  getWorkspaceDemoUser();

/** @deprecated Prefer `useWorkspaceDemoLinkedNav()` for interactive demos. */
export const WORKSPACE_DEMO_TEAMS: readonly WorkspaceNavTeam[] =
  getWorkspaceDemoTeamsSnapshot();

/** @deprecated Prefer `useWorkspaceDemoLinkedNav()` for interactive demos. */
export const WORKSPACE_DEMO_SWITCHERS: readonly WorkspaceNavContextSwitcherProps[] =
  getWorkspaceDemoSwitchersSnapshot();

export const WORKSPACE_DEMO_NAV_ITEMS = getWorkspaceDemoNavModules();
export const WORKSPACE_DEMO_FEATURE_ITEMS = getWorkspaceDemoNavFeatures();
