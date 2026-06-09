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
import { systemAdminCapabilities } from "../contract.ts";
import { createSystemAdminPermissionContext } from "../feature-scope.ts";
import type {
  CustomizationGovernanceCommand,
  RoleAssignmentCommand,
  SystemAdminCapability,
  SystemAdminMutationResult,
  SystemAdminScope,
  TenantAdminSettingUpdate,
} from "../schema.ts";
import {
  customizationGovernanceCommandSchema,
  roleAssignmentCommandSchema,
  tenantAdminSettingUpdateSchema,
} from "../schema.ts";

type SystemAdminCommand =
  | CustomizationGovernanceCommand
  | RoleAssignmentCommand
  | TenantAdminSettingUpdate;

type SystemAdminExecutionOptions<TInput extends SystemAdminCommand> = {
  action: SystemAdminCapability;
  input: TInput;
  permission: SystemAdminCapability;
  reason: string;
  resource:
    | "system-admin.customization"
    | "system-admin.tenant-settings"
    | "system-admin.users-access";
  schema: { parse: (input: TInput) => TInput };
  summary: string;
  targetId: string;
  targetType: string;
};

const buildMutationResult = (
  action: SystemAdminCapability,
  tenantId: string,
  summary: string,
  id = randomUUID()
): SystemAdminMutationResult => ({
  action,
  id,
  status: "accepted",
  summary,
  tenantId,
});

const writeSystemAdminAuditEvent = (
  event: Parameters<typeof writeAuditEvent>[0],
  db?: ExecutionDatabaseTransaction
): ReturnType<typeof writeAuditEvent> => {
  if (db) {
    return writeAuditEventInTransaction(db, event);
  }

  return writeAuditEvent(event);
};

const executeSystemAdminCommand = <TInput extends SystemAdminCommand>(
  options: SystemAdminExecutionOptions<TInput>,
  context: SystemAdminScope
): Promise<SystemAdminMutationResult> => {
  const requestId = context.requestId ?? randomUUID();
  const operationId = context.operationId ?? requestId;
  const pipeline = createExecutionPipeline<TInput, SystemAdminMutationResult>({
    executeDomainOperation: ({
      input,
      actor,
      tenant,
    }: ExecutionMutationContext<TInput>): Promise<
      ExecutionDomainResult<SystemAdminMutationResult>
    > => {
      const result = buildMutationResult(
        options.action,
        tenant.tenantId,
        options.summary
      );

      return Promise.resolve({
        action: options.action,
        after: {
          command: input,
          result,
        },
        before: {},
        channel: "server_action",
        metadata: {
          feature: "system-admin.control-plane",
        },
        module: "system-admin",
        reason: options.reason,
        result,
        route: "system-admin",
        subjectId: actor.actorId,
        subjectType: "user",
        summary: options.summary,
        surface: "control-plane",
        targetId: options.targetId,
        targetType: options.targetType,
      });
    },
    operationId,
    permissionContext: () =>
      createSystemAdminPermissionContext(
        context,
        options.action,
        options.resource
      ),
    permissionRequirement: {
      allOf: [options.permission],
    },
    requireAuth: async () => ({ actorId: context.userId }),
    requirePermission,
    requireTenantMembership: async () => undefined,
    requestId,
    resolveActiveTenant: async () => ({ tenantId: context.tenantId }),
    validateInput: (input: TInput) => {
      options.schema.parse(input);
    },
    writeAuditEvent: writeSystemAdminAuditEvent,
  });

  return pipeline(options.input);
};

export const executeTenantAdminSettingUpdate = (
  input: TenantAdminSettingUpdate,
  context: SystemAdminScope
): Promise<SystemAdminMutationResult> =>
  executeSystemAdminCommand(
    {
      action: systemAdminCapabilities.tenantSettingsWrite,
      input,
      permission: systemAdminCapabilities.tenantSettingsWrite,
      reason: input.reason,
      resource: "system-admin.tenant-settings",
      schema: tenantAdminSettingUpdateSchema,
      summary: `Accepted tenant admin setting update for ${input.key}.`,
      targetId: input.key,
      targetType: "tenant-admin-setting",
    },
    context
  );

export const executeRoleAssignment = (
  input: RoleAssignmentCommand,
  context: SystemAdminScope
): Promise<SystemAdminMutationResult> =>
  executeSystemAdminCommand(
    {
      action: systemAdminCapabilities.usersAccessWrite,
      input,
      permission: systemAdminCapabilities.usersAccessWrite,
      reason: input.reason,
      resource: "system-admin.users-access",
      schema: roleAssignmentCommandSchema,
      summary: `Accepted role assignment ${input.roleKey}.`,
      targetId: input.targetUserId,
      targetType: "user-role-assignment",
    },
    context
  );

export const executeCustomizationPublication = (
  input: CustomizationGovernanceCommand,
  context: SystemAdminScope
): Promise<SystemAdminMutationResult> =>
  executeSystemAdminCommand(
    {
      action: systemAdminCapabilities.customizationPublish,
      input,
      permission: systemAdminCapabilities.customizationPublish,
      reason: input.reason,
      resource: "system-admin.customization",
      schema: customizationGovernanceCommandSchema,
      summary: "Accepted governed customization publication.",
      targetId: input.customizationId,
      targetType: "tenant-customization",
    },
    context
  );
