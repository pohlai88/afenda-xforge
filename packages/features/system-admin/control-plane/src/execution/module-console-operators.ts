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
import {
  assignModuleConsoleOperator,
  revokeModuleConsoleOperator,
  type ModuleConsoleOperatorAssignment,
} from "../module-console-operators.ts";
import { systemAdminCapabilities } from "../contract.ts";
import { createSystemAdminPermissionContext } from "../feature-scope.ts";
import type {
  AssignModuleConsoleOperatorCommand,
  RevokeModuleConsoleOperatorCommand,
  SystemAdminScope,
} from "../schema.ts";
import {
  assignModuleConsoleOperatorCommandSchema,
  revokeModuleConsoleOperatorCommandSchema,
} from "../schema.ts";

type ModuleConsoleOperatorExecutionInput =
  | {
      command: AssignModuleConsoleOperatorCommand;
      kind: "assign";
    }
  | {
      command: RevokeModuleConsoleOperatorCommand;
      kind: "revoke";
    };

const writeSystemAdminAuditEvent = (
  event: Parameters<typeof writeAuditEvent>[0],
  db?: ExecutionDatabaseTransaction
): ReturnType<typeof writeAuditEvent> => {
  if (db) {
    return writeAuditEventInTransaction(db, event);
  }

  return writeAuditEvent(event);
};

const executeModuleConsoleOperatorMutation = async (
  input: ModuleConsoleOperatorExecutionInput,
  context: SystemAdminScope
): Promise<ModuleConsoleOperatorAssignment> => {
  if (input.kind === "assign") {
    return assignModuleConsoleOperator(input.command, context);
  }

  return revokeModuleConsoleOperator(input.command, context);
};

const runModuleConsoleOperatorPipeline = async (
  input: ModuleConsoleOperatorExecutionInput,
  context: SystemAdminScope
): Promise<ModuleConsoleOperatorAssignment> => {
  const requestId = context.requestId ?? randomUUID();
  const operationId = context.operationId ?? requestId;
  const pipeline = createExecutionPipeline<
    ModuleConsoleOperatorExecutionInput,
    ModuleConsoleOperatorAssignment
  >({
    executeDomainOperation: async ({
      input: commandInput,
    }: ExecutionMutationContext<ModuleConsoleOperatorExecutionInput>): Promise<
      ExecutionDomainResult<ModuleConsoleOperatorAssignment>
    > => {
      const result = await executeModuleConsoleOperatorMutation(
        commandInput,
        context
      );

      return {
        action: systemAdminCapabilities.moduleConsolesAssign,
        after: {
          result,
        },
        before: {},
        channel: "server_action",
        metadata: {
          feature: "system-admin.control-plane",
          kind: commandInput.kind,
        },
        module: "system-admin",
        reason: commandInput.command.reason,
        result,
        route: "/api/system-admin/module-consoles/operators",
        subjectId: context.userId,
        subjectType: "user",
        summary:
          commandInput.kind === "assign"
            ? `Assigned module console operator for ${commandInput.command.consoleId}`
            : "Revoked module console operator assignment",
        surface: "control-plane",
        targetId: result.id,
        targetType: "module-console-operator-assignment",
      };
    },
    operationId,
    permissionContext: () =>
      createSystemAdminPermissionContext(
        context,
        systemAdminCapabilities.moduleConsolesAssign,
        "system-admin.module-consoles"
      ),
    permissionRequirement: {
      allOf: [systemAdminCapabilities.moduleConsolesAssign],
    },
    requireAuth: async () => ({ actorId: context.userId }),
    requirePermission,
    requireTenantMembership: async () => undefined,
    requestId,
    resolveActiveTenant: async () => ({ tenantId: context.tenantId }),
    validateInput: (commandInput: ModuleConsoleOperatorExecutionInput) => {
      if (commandInput.kind === "assign") {
        assignModuleConsoleOperatorCommandSchema.parse(commandInput.command);
        return;
      }

      revokeModuleConsoleOperatorCommandSchema.parse(commandInput.command);
    },
    writeAuditEvent: writeSystemAdminAuditEvent,
  });

  return pipeline(input);
};

export const executeAssignModuleConsoleOperator = (
  input: AssignModuleConsoleOperatorCommand,
  context: SystemAdminScope
): Promise<ModuleConsoleOperatorAssignment> =>
  runModuleConsoleOperatorPipeline(
    {
      command: input,
      kind: "assign",
    },
    context
  );

export const executeRevokeModuleConsoleOperator = (
  input: RevokeModuleConsoleOperatorCommand,
  context: SystemAdminScope
): Promise<ModuleConsoleOperatorAssignment> =>
  runModuleConsoleOperatorPipeline(
    {
      command: input,
      kind: "revoke",
    },
    context
  );
