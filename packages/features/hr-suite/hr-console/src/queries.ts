import "server-only";

import { requirePermission } from "@repo/permissions";
import { listHrDelegationGrantSnapshots } from "./delegation.ts";
import {
  createHrConsolePermissionContext,
  hrConsoleCapabilities,
} from "./feature-scope.ts";
import {
  assertHrConsoleMutationAllowed,
  HR_CONSOLE_ID,
  resolveModuleConsoleAccess,
} from "./governance.ts";
import type {
  HrConsoleOverview,
  HrConsoleScope,
  HrConsoleSection,
  ListHrConsoleSectionsQuery,
  ModuleConsoleOperatorAssignmentSnapshot,
  ResolvedModuleConsoleAccess,
} from "./schema.ts";

const hrConsoleSections: readonly HrConsoleSection[] = [
  {
    appPath: "/hr/console",
    description: "Console status, governance mode, and section entrypoints.",
    domain: "overview",
    id: "hr.console.overview",
    requiredPermission: hrConsoleCapabilities.overviewRead,
    status: "ready",
    title: "Overview",
  },
  {
    appPath: "/hr/console/delegation",
    description: "Delegate HR console capabilities to HR managers.",
    domain: "delegation",
    id: "hr.console.delegation",
    requiredPermission: hrConsoleCapabilities.delegationRead,
    status: "ready",
    title: "Delegation",
  },
  {
    appPath: "/hr/console/leave",
    description: "Leave & Attendance configuration links into governed LAM APIs.",
    domain: "leave",
    id: "hr.console.leave",
    requiredPermission: hrConsoleCapabilities.sectionsRead,
    status: "ready",
    title: "Leave & Attendance",
  },
  {
    appPath: "/hr/console/calendars",
    description: "Holiday and work calendar governance.",
    domain: "calendars",
    id: "hr.console.calendars",
    requiredPermission: hrConsoleCapabilities.sectionsRead,
    status: "ready",
    title: "Calendars",
  },
  {
    appPath: "/hr/console/policy",
    description: "Attendance policy governance.",
    domain: "policy",
    id: "hr.console.policy",
    requiredPermission: hrConsoleCapabilities.sectionsRead,
    status: "ready",
    title: "Attendance Policy",
  },
  {
    appPath: "/hr/console/encashment",
    description: "Leave encashment governance.",
    domain: "encashment",
    id: "hr.console.encashment",
    requiredPermission: hrConsoleCapabilities.sectionsRead,
    status: "ready",
    title: "Encashment",
  },
  {
    appPath: "/hr/console/employee-access",
    description:
      "Bind auth users to employee records for LAM self-service scope resolution.",
    domain: "employee-access",
    id: "hr.console.employee-access",
    requiredPermission: hrConsoleCapabilities.sectionsRead,
    status: "ready",
    title: "Employee Access",
  },
];

export const lamLeaveConfigLinks = [
  {
    description: "Create or update leave types for the active company.",
    href: "/api/hr/leave/leave-types",
    method: "GET/POST",
    title: "Leave types",
  },
  {
    description: "Manage leave entitlement rules.",
    href: "/api/hr/leave/leave-entitlement-rules",
    method: "GET/POST",
    title: "Entitlement rules",
  },
  {
    description: "Manage leave approval routes.",
    href: "/api/hr/leave/leave-approval-routes",
    method: "GET/POST",
    title: "Approval routes",
  },
  {
    description: "Manage leave blackout periods.",
    href: "/api/hr/leave/leave-blackout-periods",
    method: "GET/POST",
    title: "Blackout periods",
  },
  {
    description: "Manage carry-forward rules.",
    href: "/api/hr/leave/leave-carry-forward-rules",
    method: "GET/POST",
    title: "Carry-forward rules",
  },
  {
    description: "Review company attendance settings.",
    href: "/api/hr/attendance/attendance-settings",
    method: "GET/POST",
    title: "Attendance settings",
  },
] as const;

export const lamCalendarConfigLinks = [
  {
    description: "Manage work calendars with weekday rules.",
    href: "/api/hr/attendance/work-calendars",
    method: "GET/POST",
    title: "Work calendars",
  },
  {
    description: "Manage holiday calendars and public holidays.",
    href: "/api/hr/attendance/holiday-calendars",
    method: "GET/POST",
    title: "Holiday calendars",
  },
] as const;

export const lamAttendancePolicyConfigLinks = [
  {
    description: "Manage lateness, grace period, and workday attendance policies.",
    href: "/api/hr/attendance/attendance-policies",
    method: "GET/POST",
    title: "Attendance policies",
  },
] as const;

export const lamEncashmentConfigLinks = [
  {
    description: "Manage leave encashment policies by leave type.",
    href: "/api/hr/leave/leave-encashment-policies",
    method: "GET/POST",
    title: "Encashment policies",
  },
] as const;

const resolveConsoleAccess = async (
  context: HrConsoleScope,
  operatorAssignments: readonly ModuleConsoleOperatorAssignmentSnapshot[]
): Promise<ResolvedModuleConsoleAccess> => {
  const delegationGrants = await listHrDelegationGrantSnapshots(
    context.tenantId,
    context.companyId
  );

  return resolveModuleConsoleAccess({
    actorId: context.userId,
    companyId: context.companyId,
    consoleId: HR_CONSOLE_ID,
    delegationGrants,
    operatorAssignments,
    tenantRole: context.tenantRole,
    tenantRoleCaps: context.grantedPermissions,
  });
};

export const buildHrConsoleAccessContext = async (
  context: HrConsoleScope,
  operatorAssignments: readonly ModuleConsoleOperatorAssignmentSnapshot[]
): Promise<ResolvedModuleConsoleAccess> =>
  resolveConsoleAccess(context, operatorAssignments);

export const listHrConsoleSections = async (
  query: ListHrConsoleSectionsQuery,
  context: HrConsoleScope,
  operatorAssignments: readonly ModuleConsoleOperatorAssignmentSnapshot[]
): Promise<HrConsoleSection[]> => {
  const access = await resolveConsoleAccess(context, operatorAssignments);

  requirePermission(
    createHrConsolePermissionContext(
      {
        ...context,
        grantedPermissions: [...access.grantedCapabilities],
      },
      hrConsoleCapabilities.sectionsRead
    ),
    { allOf: [hrConsoleCapabilities.sectionsRead] }
  );

  return hrConsoleSections.filter((section) => {
    if (query.domain && section.domain !== query.domain) {
      return false;
    }

    return access.grantedCapabilities.includes(section.requiredPermission);
  });
};

export const readHrConsoleOverview = async (
  context: HrConsoleScope,
  operatorAssignments: readonly ModuleConsoleOperatorAssignmentSnapshot[]
): Promise<HrConsoleOverview> => {
  const access = await resolveConsoleAccess(context, operatorAssignments);

  requirePermission(
    createHrConsolePermissionContext(
      {
        ...context,
        grantedPermissions: [...access.grantedCapabilities],
      },
      hrConsoleCapabilities.overviewRead
    ),
    { allOf: [hrConsoleCapabilities.overviewRead] }
  );

  const sections = await listHrConsoleSections(
    {},
    context,
    operatorAssignments
  );

  const warnings =
    access.governanceMode === "unassigned_fallback"
      ? [
          "No HR console operator is assigned. System Admin is operating the console under SME fallback policy.",
        ]
      : access.actingAsConsoleOperator
        ? []
        : access.grantedCapabilities.includes(
              hrConsoleCapabilities.delegationManage
            )
          ? []
          : [
              "An HR console operator is assigned. System Admin retains assignment authority but is read-only for delegation and domain writes.",
            ];

  return {
    ...(access.actingAsConsoleOperator
      ? { actingAsConsoleOperator: true }
      : {}),
    canDelegate: access.canDelegate,
    canDomainWrite: access.canDomainWrite,
    companyId: context.companyId,
    governanceMode: access.governanceMode,
    grantedCapabilities: [...access.grantedCapabilities],
    sections,
    tenantId: context.tenantId,
    warnings,
  };
};

export const assertHrConsoleWriteAccess = (
  access: ResolvedModuleConsoleAccess,
  requiredCapabilities: readonly string[]
): void => {
  assertHrConsoleMutationAllowed(access, requiredCapabilities);
};

export const hrConsoleSectionRegistry = hrConsoleSections;
