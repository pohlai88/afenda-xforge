import "server-only";

import { randomUUID } from "node:crypto";
import { writeAuditEvent, writeAuditEventInTransaction } from "@repo/audit";
import type {
  ExecutionDatabaseTransaction,
  ExecutionDomainResult,
  ExecutionMutationContext,
} from "@repo/execution";
import { createExecutionPipeline } from "@repo/execution";
import { requirePermission } from "@repo/permissions";
import { grantHrDelegation, revokeHrDelegation } from "../delegation.ts";
import {
  createHrConsolePermissionContext,
  hrConsoleCapabilities,
} from "../feature-scope.ts";
import {
  assertHrConsoleMutationAllowed,
  assertDelegatableCapabilities,
  canGrantHrDelegation,
} from "../governance.ts";
import { buildHrConsoleAccessContext } from "../queries.ts";
import type {
  GrantHrDelegationCommand,
  HrConsoleScope,
  HrDelegationGrant,
  ModuleConsoleOperatorAssignmentSnapshot,
  RevokeHrDelegationCommand,
} from "../schema.ts";
import {
  grantHrDelegationCommandSchema,
  revokeHrDelegationCommandSchema,
} from "../schema.ts";

type DelegationExecutionInput =
  | {
      command: GrantHrDelegationCommand;
      kind: "grant";
    }
  | {
      command: RevokeHrDelegationCommand;
      kind: "revoke";
    };

type DelegationExecutionContext = {
  operatorAssignments: readonly ModuleConsoleOperatorAssignmentSnapshot[];
  scope: HrConsoleScope;
};

const writeHrConsoleAuditEvent = (
  event: Parameters<typeof writeAuditEvent>[0],
  db?: ExecutionDatabaseTransaction
): ReturnType<typeof writeAuditEvent> => {
  if (db) {
    return writeAuditEventInTransaction(db, event);
  }

  return writeAuditEvent(event);
};

const executeDelegationMutation = async (
  input: DelegationExecutionInput,
  context: DelegationExecutionContext
): Promise<HrDelegationGrant> => {
  const access = await buildHrConsoleAccessContext(
    context.scope,
    context.operatorAssignments
  );

  if (!canGrantHrDelegation(access)) {
    throw new Error(
      "Delegation mutation is denied for the resolved console governance mode"
    );
  }

  assertHrConsoleMutationAllowed(access, [
    hrConsoleCapabilities.delegationManage,
  ]);

  if (input.kind === "grant") {
    assertDelegatableCapabilities(access, input.command.capabilities);
  }

  if (input.kind === "grant") {
    return grantHrDelegation({
      capabilities: input.command.capabilities,
      companyId: context.scope.companyId,
      granteeId: input.command.granteeId,
      grantorId: context.scope.userId,
      reason: input.command.reason,
      tenantId: context.scope.tenantId,
      ...(input.command.validFrom ? { validFrom: input.command.validFrom } : {}),
      ...(input.command.validTo ? { validTo: input.command.validTo } : {}),
    });
  }

  return revokeHrDelegation({
    companyId: context.scope.companyId,
    grantId: input.command.grantId,
    grantorId: context.scope.userId,
    reason: input.command.reason,
    tenantId: context.scope.tenantId,
  });
};

const runDelegationPipeline = async (
  input: DelegationExecutionInput,
  context: DelegationExecutionContext
): Promise<HrDelegationGrant> => {
  const access = await buildHrConsoleAccessContext(
    context.scope,
    context.operatorAssignments
  );
  const requestId = context.scope.requestId ?? randomUUID();
  const operationId = context.scope.operationId ?? requestId;
  const pipeline = createExecutionPipeline<
    DelegationExecutionInput,
    HrDelegationGrant
  >({
    executeDomainOperation: async ({
      input: commandInput,
    }: ExecutionMutationContext<DelegationExecutionInput>): Promise<
      ExecutionDomainResult<HrDelegationGrant>
    > => {
      const result = await executeDelegationMutation(commandInput, context);

      return {
        action: hrConsoleCapabilities.delegationManage,
        after: {
          result,
        },
        before: {},
        channel: "server_action",
        metadata: {
          actingAsConsoleOperator: access.actingAsConsoleOperator ?? false,
          feature: "hr.console",
          governanceMode: access.governanceMode,
          kind: commandInput.kind,
        },
        module: "hr-console",
        reason:
          commandInput.kind === "grant"
            ? commandInput.command.reason
            : commandInput.command.reason,
        result,
        route: "/api/hr/console/delegation",
        subjectId: context.scope.userId,
        subjectType: "user",
        summary:
          commandInput.kind === "grant"
            ? "Granted HR console delegation"
            : "Revoked HR console delegation",
        surface: "hr-console",
        targetId: result.id,
        targetType: "hr-delegation-grant",
      };
    },
    operationId,
    permissionContext: () =>
      createHrConsolePermissionContext(
        {
          ...context.scope,
          grantedPermissions: [...access.grantedCapabilities],
        },
        hrConsoleCapabilities.delegationManage,
        "hr.console.delegation"
      ),
    permissionRequirement: {
      allOf: [hrConsoleCapabilities.delegationManage],
    },
    requireAuth: async () => ({ actorId: context.scope.userId }),
    requirePermission,
    requireTenantMembership: async () => undefined,
    requestId,
    resolveActiveTenant: async () => ({ tenantId: context.scope.tenantId }),
    validateInput: (commandInput: DelegationExecutionInput) => {
      if (commandInput.kind === "grant") {
        grantHrDelegationCommandSchema.parse(commandInput.command);
        return;
      }

      revokeHrDelegationCommandSchema.parse(commandInput.command);
    },
    writeAuditEvent: writeHrConsoleAuditEvent,
  });

  return pipeline(input);
};

export const executeGrantHrDelegation = (
  input: GrantHrDelegationCommand,
  context: DelegationExecutionContext
): Promise<HrDelegationGrant> =>
  runDelegationPipeline(
    {
      command: input,
      kind: "grant",
    },
    context
  );

export const executeRevokeHrDelegation = (
  input: RevokeHrDelegationCommand,
  context: DelegationExecutionContext
): Promise<HrDelegationGrant> =>
  runDelegationPipeline(
    {
      command: input,
      kind: "revoke",
    },
    context
  );
