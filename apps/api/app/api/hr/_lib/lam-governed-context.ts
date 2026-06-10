import "server-only";

import type {
  LamPolicyCapability,
  LamReadContext,
  LamWriteContext,
} from "@repo/features-time-attendance-leave-attendance-management/contract";
import { requireActiveCompanyAccess } from "@repo/auth/server";
import { resolvePermissionsForTenantRole } from "@repo/permissions";
import {
  createLamContextFromHrConsoleAccess,
  resolveHrConsoleAccessForRequest,
} from "../../_lib/hr-console-context.ts";
import {
  resolveLamOperationalEmployeeScope,
  type LamOperationalEmployeeScope,
} from "./lam-operational-employee-scope.ts";

export type LamGovernedWriteContext = LamWriteContext & {
  actorId?: string;
  actingAsConsoleOperator?: boolean;
  canWrite?: boolean;
  governanceMode?: "operator_assigned" | "unassigned_fallback";
  grantedCapabilities?: LamPolicyCapability[];
};

export const isLamOrchestrationHeaderMode = (): boolean =>
  process.env.AFENDA_LAM_TRUST_ORCHESTRATION_HEADERS === "true";

const header = (request: Request, name: string): string | undefined =>
  request.headers.get(name)?.trim() || undefined;

const boolHeader = (request: Request, name: string): boolean | undefined => {
  const value = header(request, name);
  if (!value) {
    return;
  }

  return value === "true" || value === "1";
};

const parseCapabilities = (
  request: Request
): LamPolicyCapability[] | undefined => {
  const raw = header(request, "x-lam-capabilities");
  if (!raw) {
    return;
  }

  return raw
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean) as LamPolicyCapability[];
};

const parseTeamEmployeeIds = (request: Request): string[] | undefined => {
  const raw = header(request, "x-lam-team-employee-ids");
  if (!raw) {
    return;
  }

  return raw
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
};

const parseResolvedStepApproverEmployeeIds = (
  request: Request
): string[] | undefined => {
  const raw = header(request, "x-lam-resolved-step-approver-employee-ids");
  if (!raw) {
    return;
  }

  return raw
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
};

const parseResolvedHrFallbackApproverEmployeeIds = (
  request: Request
): string[] | undefined => {
  const raw = header(
    request,
    "x-lam-resolved-hr-fallback-approver-employee-ids"
  );
  if (!raw) {
    return;
  }

  return raw
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
};

export const mergeLamOperationalHeaders = <
  T extends LamReadContext | LamWriteContext,
>(
  request: Request,
  context: T
): T => {
  const writeContext = context as LamWriteContext;

  return {
    ...context,
    actorEmployeeId:
      header(request, "x-lam-actor-employee-id") ?? writeContext.actorEmployeeId,
    hrFallbackDelegated:
      boolHeader(request, "x-lam-hr-fallback-delegated") ??
      writeContext.hrFallbackDelegated,
    resolvedHrFallbackApproverEmployeeIds:
      parseResolvedHrFallbackApproverEmployeeIds(request) ??
      writeContext.resolvedHrFallbackApproverEmployeeIds,
    resolvedStepApproverEmployeeIds:
      parseResolvedStepApproverEmployeeIds(request) ??
      writeContext.resolvedStepApproverEmployeeIds,
    scopedEmployeeId:
      header(request, "x-lam-scoped-employee-id") ?? context.scopedEmployeeId,
    teamEmployeeIds:
      parseTeamEmployeeIds(request) ?? context.teamEmployeeIds,
  };
};

export type LamOperationalWriteContext = LamWriteContext & {
  actorId?: string;
  canWrite?: boolean;
  grantedCapabilities?: LamPolicyCapability[];
};

const isOperationalWriteCapability = (capability: string): boolean =>
  capability.startsWith("hr.lam.") &&
  (capability.endsWith(".write") ||
    capability.endsWith(".approve") ||
    capability === "hr.lam.reports.export");

const resolveLamTenantOperationalAccess = async (): Promise<
  {
    actorId: string;
    canRead: boolean;
    canWrite: boolean;
    companyId: string;
    grantedCapabilities: LamPolicyCapability[];
    tenantId: string;
  } & LamOperationalEmployeeScope
> => {
  const access = await requireActiveCompanyAccess();
  const grantedPermissions = resolvePermissionsForTenantRole(
    access.membership.role
  );
  const lamCapabilities = grantedPermissions.filter((capability) =>
    capability.startsWith("hr.lam.")
  ) as LamPolicyCapability[];
  const employeeScope = await resolveLamOperationalEmployeeScope({
    companyId: access.company.companyId,
    grantedCapabilities: lamCapabilities,
    tenantId: access.membership.tenantId,
    userId: access.user.id,
    userMetadata: access.user.user_metadata,
  });

  return {
    actorId: access.user.id,
    canRead: lamCapabilities.length > 0,
    canWrite: lamCapabilities.some(isOperationalWriteCapability),
    companyId: access.company.companyId,
    grantedCapabilities: lamCapabilities,
    tenantId: access.membership.tenantId,
    ...employeeScope,
  };
};

const createHeaderTrustedOperationalWriteContext = (
  request: Request
): LamOperationalWriteContext => {
  const lamCapabilities = parseCapabilities(request);

  return {
    actorId: header(request, "x-actor-id") ?? "api",
    canRead: boolHeader(request, "x-can-read-lam") ?? false,
    canViewSensitive: boolHeader(request, "x-can-view-sensitive") ?? false,
    canWrite: boolHeader(request, "x-can-write-lam") ?? false,
    companyId: header(request, "x-company-id"),
    tenantId: header(request, "x-tenant-id"),
    grantedCapabilities: lamCapabilities,
    ...mergeLamOperationalHeaders(request, {
      actorEmployeeId: header(request, "x-lam-actor-employee-id"),
      hrFallbackDelegated: boolHeader(request, "x-lam-hr-fallback-delegated"),
      resolvedHrFallbackApproverEmployeeIds:
        parseResolvedHrFallbackApproverEmployeeIds(request),
      resolvedStepApproverEmployeeIds:
        parseResolvedStepApproverEmployeeIds(request),
      scopedEmployeeId: header(request, "x-lam-scoped-employee-id"),
      teamEmployeeIds: parseTeamEmployeeIds(request),
    }),
  };
};

export const createLamOperationalWriteContext = async (
  request: Request
): Promise<LamOperationalWriteContext> => {
  if (isLamOrchestrationHeaderMode()) {
    return createHeaderTrustedOperationalWriteContext(request);
  }

  const sessionAccess = await resolveLamTenantOperationalAccess();

  return mergeLamOperationalHeaders(request, {
    actorId: sessionAccess.actorId,
    actorEmployeeId: sessionAccess.actorEmployeeId,
    canRead: sessionAccess.canRead,
    canViewSensitive: false,
    canWrite: sessionAccess.canWrite,
    companyId: sessionAccess.companyId,
    grantedCapabilities: sessionAccess.grantedCapabilities,
    scopedEmployeeId: sessionAccess.scopedEmployeeId,
    tenantId: sessionAccess.tenantId,
  });
};

export const createLamOperationalReadContext = async (
  request: Request
): Promise<LamReadContext> => {
  if (isLamOrchestrationHeaderMode()) {
    return {
      canRead: boolHeader(request, "x-can-read-lam") ?? false,
      canViewSensitive: boolHeader(request, "x-can-view-sensitive") ?? false,
      companyId: header(request, "x-company-id"),
      tenantId: header(request, "x-tenant-id"),
      grantedCapabilities: parseCapabilities(request),
      scopedEmployeeId: header(request, "x-lam-scoped-employee-id"),
      teamEmployeeIds: parseTeamEmployeeIds(request),
    };
  }

  const sessionAccess = await resolveLamTenantOperationalAccess();

  return mergeLamOperationalHeaders(request, {
    canRead: sessionAccess.canRead,
    canViewSensitive: false,
    companyId: sessionAccess.companyId,
    grantedCapabilities: sessionAccess.grantedCapabilities,
    scopedEmployeeId: sessionAccess.scopedEmployeeId,
    tenantId: sessionAccess.tenantId,
  });
};

export const createLamConfigWriteContextFromSession =
  async (): Promise<LamGovernedWriteContext> => {
    const { access, scope } = await resolveHrConsoleAccessForRequest();
    const lamCapabilities = access.grantedCapabilities.filter((capability) =>
      capability.startsWith("hr.lam.")
    ) as LamPolicyCapability[];

    return {
      ...createLamContextFromHrConsoleAccess(scope, access),
      actingAsConsoleOperator: access.actingAsConsoleOperator,
      canWrite: false,
      governanceMode: access.governanceMode,
      grantedCapabilities: lamCapabilities,
    };
  };

const createHeaderTrustedWriteContext = (
  request: Request
): LamGovernedWriteContext => {
  const lamCapabilities = parseCapabilities(request) ?? [];

  return {
    actorId: header(request, "x-actor-id") ?? "api",
    canRead: boolHeader(request, "x-can-read-lam") ?? false,
    canViewSensitive: boolHeader(request, "x-can-view-sensitive") ?? false,
    canWrite: false,
    companyId: header(request, "x-company-id"),
    tenantId: header(request, "x-tenant-id"),
    grantedCapabilities: lamCapabilities,
    ...mergeLamOperationalHeaders(request, {
      actorEmployeeId: header(request, "x-lam-actor-employee-id"),
      hrFallbackDelegated: boolHeader(request, "x-lam-hr-fallback-delegated"),
      resolvedHrFallbackApproverEmployeeIds:
        parseResolvedHrFallbackApproverEmployeeIds(request),
      resolvedStepApproverEmployeeIds:
        parseResolvedStepApproverEmployeeIds(request),
      scopedEmployeeId: header(request, "x-lam-scoped-employee-id"),
      teamEmployeeIds: parseTeamEmployeeIds(request),
    }),
  };
};

export const createLamConfigWriteContext = async (
  request: Request
): Promise<LamGovernedWriteContext> => {
  if (isLamOrchestrationHeaderMode()) {
    return createHeaderTrustedWriteContext(request);
  }

  const { access, scope } = await resolveHrConsoleAccessForRequest();
  const lamCapabilities = access.grantedCapabilities.filter((capability) =>
    capability.startsWith("hr.lam.")
  ) as LamPolicyCapability[];

  return mergeLamOperationalHeaders(request, {
    ...createLamContextFromHrConsoleAccess(scope, access),
    actingAsConsoleOperator: access.actingAsConsoleOperator,
    canWrite: false,
    governanceMode: access.governanceMode,
    grantedCapabilities: lamCapabilities,
  });
};

export const createLamConfigReadContext = async (
  request: Request
): Promise<LamReadContext> => {
  if (isLamOrchestrationHeaderMode()) {
    return {
      canRead: boolHeader(request, "x-can-read-lam") ?? false,
      canViewSensitive: boolHeader(request, "x-can-view-sensitive") ?? false,
      companyId: header(request, "x-company-id"),
      tenantId: header(request, "x-tenant-id"),
      grantedCapabilities: parseCapabilities(request),
      scopedEmployeeId: header(request, "x-lam-scoped-employee-id"),
      teamEmployeeIds: parseTeamEmployeeIds(request),
    };
  }

  const { access, scope } = await resolveHrConsoleAccessForRequest();
  const lamCapabilities = access.grantedCapabilities.filter((capability) =>
    capability.startsWith("hr.lam.")
  ) as LamPolicyCapability[];

  return mergeLamOperationalHeaders(request, {
    actorId: scope.userId,
    canRead: lamCapabilities.length > 0,
    canViewSensitive: false,
    companyId: scope.companyId,
    grantedCapabilities: lamCapabilities,
    tenantId: scope.tenantId,
  });
};
