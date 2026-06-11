"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "../../ui-shadcn/sidebar";
import { cn } from "../../../lib/utils";
import type { ComponentProps, ReactElement, ReactNode } from "react";
import {
  WORKSPACE_SHELL_SPACE,
  WORKSPACE_SHELL_TYPE,
} from "./6.1-workspace-shell.typography.ts";

type WorkspaceAppSidebarProps = {
  children: ReactNode;
  className?: string;
  collapsible?: ComponentProps<typeof Sidebar>["collapsible"];
  variant?: ComponentProps<typeof Sidebar>["variant"];
};

export function WorkspaceAppSidebar({
  children,
  className,
  collapsible = "offcanvas",
  variant = "inset",
}: WorkspaceAppSidebarProps): ReactElement {
  return (
    <Sidebar className={className} collapsible={collapsible} variant={variant}>
      {children}
    </Sidebar>
  );
}

export function WorkspaceAppSidebarHeader({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}): ReactElement {
  return (
    <SidebarHeader
      className={cn(
        WORKSPACE_SHELL_SPACE.sidebarRoot,
        WORKSPACE_SHELL_TYPE.sidebarRoot,
        className
      )}
      data-slot="workspace-sidebar-header"
    >
      {children}
    </SidebarHeader>
  );
}

export function WorkspaceAppSidebarContent({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}): ReactElement {
  return (
    <SidebarContent
      className={cn(
        "min-h-0 flex-1",
        WORKSPACE_SHELL_SPACE.sidebarRoot,
        WORKSPACE_SHELL_SPACE.sidebarSectionGap,
        WORKSPACE_SHELL_TYPE.sidebarRoot,
        className
      )}
      data-slot="workspace-sidebar-content"
    >
      {children}
    </SidebarContent>
  );
}

/** Section label — shared typography for nav-main, nav-secondary, memory lane. */
export function WorkspaceSidebarSectionLabel({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}): ReactElement {
  return (
    <p className={cn(WORKSPACE_SHELL_TYPE.sectionLabel, className)}>
      {children}
    </p>
  );
}

/** Workspace modules — top of the scrollable rail (ERP modules, pages). */
export function WorkspaceSidebarNavMain({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}): ReactElement {
  return (
    <section className={cn("flex flex-col", className)} data-slot="workspace-nav-main">
      {children}
    </section>
  );
}

/** Feature shortcuts — below nav-main, still in the scroll region. */
export function WorkspaceSidebarNavSecondary({
  children,
  className,
  label = "Features",
}: {
  children: ReactNode;
  className?: string;
  label?: string;
}): ReactElement {
  return (
    <section
      className={cn("flex flex-col", className)}
      data-slot="workspace-nav-secondary"
    >
      <WorkspaceSidebarSectionLabel>{label}</WorkspaceSidebarSectionLabel>
      <div
        className={cn(
          WORKSPACE_SHELL_SPACE.sidebarLabelGap,
          WORKSPACE_SHELL_SPACE.navListGap
        )}
      >
        {children}
      </div>
    </section>
  );
}

/** Tenant capture rail — quick tasks, lists, tags at top of sidebar. */
export function WorkspaceSidebarNavMemoryLane({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}): ReactElement {
  return (
    <section
      className={cn(className)}
      data-slot="workspace-nav-memory-lane"
    >
      {children}
    </section>
  );
}

export function WorkspaceAppSidebarFooter({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}): ReactElement {
  return (
    <SidebarFooter
      className={cn(
        WORKSPACE_SHELL_SPACE.sidebarRoot,
        "pb-2 pt-0",
        WORKSPACE_SHELL_TYPE.sidebarRoot,
        className
      )}
      data-slot="workspace-nav-user-region"
    >
      {children}
    </SidebarFooter>
  );
}
