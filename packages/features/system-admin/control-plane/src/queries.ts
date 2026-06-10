import "server-only";

import { requirePermission } from "@repo/permissions";
import {
  listRegisteredModuleConsoles,
  type ModuleConsoleRegistration,
} from "./module-console-registry.ts";
import { listModuleConsoleOperatorAssignments } from "./module-console-operators.ts";
import { systemAdminCapabilities } from "./contract.ts";
import { createSystemAdminPermissionContext } from "./feature-scope.ts";
import type {
  ListModuleConsoleOperatorAssignmentsQuery,
  ListSystemAdminSectionsQuery,
  SystemAdminOverview,
  SystemAdminScope,
  SystemAdminSection,
} from "./schema.ts";

const systemAdminSections: readonly SystemAdminSection[] = [
  {
    description: "Tenant-scoped control-plane status and governance warnings.",
    domain: "overview",
    id: "system-admin.overview",
    requiredPermission: systemAdminCapabilities.overviewRead,
    status: "ready",
    title: "Overview",
  },
  {
    description: "Governed tenant display and operating settings.",
    domain: "tenant-settings",
    id: "system-admin.tenant-settings",
    requiredPermission: systemAdminCapabilities.tenantSettingsRead,
    status: "ready",
    title: "Tenant Settings",
  },
  {
    description: "User, role, and permission administration entrypoints.",
    domain: "users-access",
    id: "system-admin.users-access",
    requiredPermission: systemAdminCapabilities.usersAccessRead,
    status: "deferred",
    title: "Users & Access",
  },
  {
    description: "Governed tenant customization review and publication.",
    domain: "customization-governance",
    id: "system-admin.customization-governance",
    requiredPermission: systemAdminCapabilities.customizationRead,
    status: "ready",
    title: "Customization Governance",
  },
  {
    description: "Audit evidence discovery through the audit package.",
    domain: "audit",
    id: "system-admin.audit",
    requiredPermission: systemAdminCapabilities.auditRead,
    status: "ready",
    title: "Audit Trail",
  },
  {
    description: "Read-only operational health and metrics summaries.",
    domain: "health-metrics",
    id: "system-admin.health-metrics",
    requiredPermission: systemAdminCapabilities.healthRead,
    status: "deferred",
    title: "Health & Metrics",
  },
  {
    description:
      "Registered module consoles and console operator assignments.",
    domain: "module-consoles",
    id: "system-admin.module-consoles",
    requiredPermission: systemAdminCapabilities.moduleConsolesRead,
    status: "ready",
    title: "Module Consoles",
  },
];

export const listSystemAdminSections = (
  query: ListSystemAdminSectionsQuery,
  context: SystemAdminScope
): SystemAdminSection[] => {
  requirePermission(
    createSystemAdminPermissionContext(
      context,
      systemAdminCapabilities.overviewRead
    ),
    { allOf: [systemAdminCapabilities.overviewRead] }
  );

  return systemAdminSections.filter(
    (section) => !query.domain || section.domain === query.domain
  );
};

export const readSystemAdminOverview = (
  context: SystemAdminScope
): SystemAdminOverview => {
  const sections = listSystemAdminSections({}, context);

  return {
    sections,
    tenantId: context.tenantId,
    warnings: [
      "Full admin UI route is deferred until the admin shell is finalized.",
      "System admin must compose governed foundation packages and must not own platform authority.",
    ],
  };
};

export const listRegisteredModuleConsolesForSystemAdmin = (
  context: SystemAdminScope
): ModuleConsoleRegistration[] => {
  requirePermission(
    createSystemAdminPermissionContext(
      context,
      systemAdminCapabilities.moduleConsolesRead,
      "system-admin.module-consoles"
    ),
    { allOf: [systemAdminCapabilities.moduleConsolesRead] }
  );

  return listRegisteredModuleConsoles();
};

export const listModuleConsoleOperatorAssignmentsForSystemAdmin = async (
  query: ListModuleConsoleOperatorAssignmentsQuery,
  context: SystemAdminScope
) => listModuleConsoleOperatorAssignments(context, query);
