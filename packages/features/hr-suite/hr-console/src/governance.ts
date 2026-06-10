import { permissionCatalog } from "@repo/permissions";
import {
  hrConsoleLamWriteCapabilities,
  hrConsoleOperatorCapabilities,
  hrConsoleReadCapabilities,
} from "./feature-scope.ts";
import type {
  HrDelegationGrantSnapshot,
  ModuleConsoleGovernanceMode,
  ModuleConsoleOperatorAssignmentSnapshot,
  ResolvedModuleConsoleAccess,
} from "./schema.ts";

export const HR_CONSOLE_ID = "hr.console";

const dedupeCapabilities = (capabilities: readonly string[]): string[] =>
  Array.from(new Set(capabilities));

const isSystemAdminWithModuleConsolesRead = (
  tenantRole: string,
  grantedPermissions: readonly string[]
): boolean =>
  (tenantRole === "admin" || tenantRole === "owner") &&
  grantedPermissions.includes(
    permissionCatalog.systemAdmin.moduleConsolesRead
  );

const isTimeBoundedActive = (
  entry: {
    revokedAt?: string;
    validFrom?: string;
    validTo?: string;
  },
  now: Date
): boolean => {
  if (entry.revokedAt) {
    return false;
  }

  if (entry.validFrom && new Date(entry.validFrom) > now) {
    return false;
  }

  if (entry.validTo && new Date(entry.validTo) < now) {
    return false;
  }

  return true;
};

const isActiveAssignment = (
  assignment: ModuleConsoleOperatorAssignmentSnapshot,
  consoleId: string,
  companyId: string,
  now = new Date()
): boolean =>
  assignment.consoleId === consoleId &&
  assignment.companyId === companyId &&
  isTimeBoundedActive(assignment, now);

export const resolveModuleConsoleGovernanceMode = (
  assignments: readonly ModuleConsoleOperatorAssignmentSnapshot[],
  consoleId: string,
  companyId: string
): ModuleConsoleGovernanceMode =>
  assignments.some((assignment) =>
    isActiveAssignment(assignment, consoleId, companyId)
  )
    ? "operator_assigned"
    : "unassigned_fallback";

const readEnvelope = (): string[] =>
  dedupeCapabilities([
    ...hrConsoleReadCapabilities,
    permissionCatalog.systemAdmin.moduleConsolesRead,
    permissionCatalog.systemAdmin.moduleConsolesAssign,
  ]);

const fullOperatorEnvelope = (
  operatorAssignments: readonly ModuleConsoleOperatorAssignmentSnapshot[],
  actorId: string,
  consoleId: string,
  companyId: string
): string[] => {
  const actorAssignment = operatorAssignments.find(
    (assignment) =>
      assignment.operatorUserId === actorId &&
      isActiveAssignment(assignment, consoleId, companyId)
  );

  if (actorAssignment?.capabilities?.length) {
    return dedupeCapabilities(actorAssignment.capabilities);
  }

  return dedupeCapabilities(hrConsoleOperatorCapabilities);
};

const isGrantActive = (
  grant: HrDelegationGrantSnapshot,
  now: Date
): boolean => isTimeBoundedActive(grant, now);

const activeDelegationCapabilities = (
  grants: readonly HrDelegationGrantSnapshot[],
  actorId: string,
  companyId: string,
  now = new Date()
): string[] =>
  dedupeCapabilities(
    grants
      .filter(
        (grant) =>
          grant.granteeId === actorId &&
          grant.companyId === companyId &&
          isGrantActive(grant, now)
      )
      .flatMap((grant) => grant.capabilities)
  );

const includesDomainWriteCapability = (
  capabilities: readonly string[]
): boolean =>
  capabilities.some(
    (capability) =>
      hrConsoleLamWriteCapabilities.includes(
        capability as (typeof hrConsoleLamWriteCapabilities)[number]
      ) || capability === permissionCatalog.hrConsole.delegationManage
  );

export const resolveModuleConsoleAccess = (input: {
  actorId: string;
  companyId: string;
  consoleId: string;
  delegationGrants: readonly HrDelegationGrantSnapshot[];
  operatorAssignments: readonly ModuleConsoleOperatorAssignmentSnapshot[];
  tenantRole: string;
  tenantRoleCaps: readonly string[];
}): ResolvedModuleConsoleAccess => {
  const governanceMode = resolveModuleConsoleGovernanceMode(
    input.operatorAssignments,
    input.consoleId,
    input.companyId
  );
  const isSystemAdmin = isSystemAdminWithModuleConsolesRead(
    input.tenantRole,
    input.tenantRoleCaps
  );
  const actorIsAssignedOperator = input.operatorAssignments.some(
    (assignment) =>
      assignment.operatorUserId === input.actorId &&
      isActiveAssignment(assignment, input.consoleId, input.companyId)
  );

  let grantedCapabilities: string[] = [];
  let actingAsConsoleOperator = false;
  let canDelegate = false;
  let canDomainWrite = false;

  if (isSystemAdmin && governanceMode === "unassigned_fallback") {
    grantedCapabilities = dedupeCapabilities([
      ...fullOperatorEnvelope(
        input.operatorAssignments,
        input.actorId,
        input.consoleId,
        input.companyId
      ),
      permissionCatalog.systemAdmin.moduleConsolesAssign,
    ]);
    actingAsConsoleOperator = true;
    canDelegate = true;
    canDomainWrite = true;
  } else if (isSystemAdmin && governanceMode === "operator_assigned") {
    grantedCapabilities = readEnvelope();
    canDelegate = false;
    canDomainWrite = false;
  } else if (actorIsAssignedOperator) {
    grantedCapabilities = fullOperatorEnvelope(
      input.operatorAssignments,
      input.actorId,
      input.consoleId,
      input.companyId
    );
    canDelegate = grantedCapabilities.includes(
      permissionCatalog.hrConsole.delegationManage
    );
    canDomainWrite = includesDomainWriteCapability(grantedCapabilities);
  } else {
    const tenantLamCapabilities = input.tenantRoleCaps.filter(
      (capability) =>
        capability.startsWith("hr.lam.") || capability.startsWith("hr.console.")
    );
    grantedCapabilities = dedupeCapabilities([
      ...tenantLamCapabilities,
      ...activeDelegationCapabilities(
        input.delegationGrants,
        input.actorId,
        input.companyId
      ),
    ]);
    canDelegate = grantedCapabilities.includes(
      permissionCatalog.hrConsole.delegationManage
    );
    canDomainWrite = includesDomainWriteCapability(grantedCapabilities);
  }

  grantedCapabilities = dedupeCapabilities([
    ...grantedCapabilities,
    ...activeDelegationCapabilities(
      input.delegationGrants,
      input.actorId,
      input.companyId
    ),
  ]);

  canDelegate =
    canDelegate ||
    grantedCapabilities.includes(
      permissionCatalog.hrConsole.delegationManage
    );
  canDomainWrite =
    canDomainWrite || includesDomainWriteCapability(grantedCapabilities);

  return {
    ...(actingAsConsoleOperator ? { actingAsConsoleOperator } : {}),
    canDelegate,
    canDomainWrite,
    governanceMode,
    grantedCapabilities,
  };
};

export const assertHrConsoleMutationAllowed = (
  access: ResolvedModuleConsoleAccess,
  requiredCapabilities: readonly string[]
): void => {
  for (const capability of requiredCapabilities) {
    if (!access.grantedCapabilities.includes(capability)) {
      throw new Error(`Missing required capability: ${capability}`);
    }
  }
};

export const canGrantHrDelegation = (
  access: ResolvedModuleConsoleAccess
): boolean => access.canDelegate;

export const assertDelegatableCapabilities = (
  access: ResolvedModuleConsoleAccess,
  requestedCapabilities: readonly string[]
): void => {
  const delegatableCapabilities = new Set<string>([
    ...hrConsoleOperatorCapabilities,
  ]);

  for (const capability of requestedCapabilities) {
    if (!delegatableCapabilities.has(capability)) {
      throw new Error(`Capability is not delegatable: ${capability}`);
    }

    if (!access.grantedCapabilities.includes(capability)) {
      throw new Error(
        `Cannot grant capability outside operator envelope: ${capability}`
      );
    }
  }
};
