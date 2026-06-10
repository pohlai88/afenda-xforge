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
import { accessCapabilities } from "../domains/access/contract.ts";
import { roleAssignmentCommandSchema } from "../domains/access/schema.ts";
import { customizationCapabilities } from "../domains/customization/contract.ts";
import { customizationGovernanceCommandSchema } from "../domains/customization/schema.ts";
import { tenantSettingsCapabilities } from "../domains/tenant-settings/contract.ts";
import { tenantAdminSettingUpdateSchema } from "../domains/tenant-settings/schema.ts";
import { setTenantBranding } from "@repo/design-system/tenant-branding";
import { upsertTenantAdminSetting } from "../domains/tenant-settings/repository.server.ts";
import { createSystemAdminPermissionContext } from "../feature-scope.ts";
import type {
  CustomizationGovernanceCommand,
  RoleAssignmentCommand,
  SystemAdminCapability,
  SystemAdminMutationResult,
  SystemAdminScope,
  TenantAdminSettingUpdate,
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

export type SystemAdminExecutionDependencies = {
  createExecutionPipeline?: typeof createExecutionPipeline;
  createId?: () => string;
  requirePermission?: typeof requirePermission;
  upsertTenantAdminSetting?: typeof upsertTenantAdminSetting;
  writeAuditEvent?: typeof writeAuditEvent;
  writeAuditEventInTransaction?: typeof writeAuditEventInTransaction;
};

const buildMutationResult = (
  action: SystemAdminCapability,
  tenantId: string,
  summary: string,
  createId: () => string,
  id = createId()
): SystemAdminMutationResult => ({
  action,
  id,
  status: "accepted",
  summary,
  tenantId,
});

export const createSystemAdminExecutionHandlers = (
  dependencies: SystemAdminExecutionDependencies = {}
) => {
  const createId = dependencies.createId ?? randomUUID;
  const createPipeline =
    dependencies.createExecutionPipeline ?? createExecutionPipeline;
  const requirePermissionHook =
    dependencies.requirePermission ?? requirePermission;
  const persistAuditEvent = dependencies.writeAuditEvent ?? writeAuditEvent;
  const persistAuditEventInTransaction =
    dependencies.writeAuditEventInTransaction ?? writeAuditEventInTransaction;
  const persistTenantAdminSetting =
    dependencies.upsertTenantAdminSetting ?? upsertTenantAdminSetting;

  const writeSystemAdminAuditEvent = (
    event: Parameters<typeof writeAuditEvent>[0],
    db?: ExecutionDatabaseTransaction
  ): ReturnType<typeof writeAuditEvent> => {
    if (db) {
      return persistAuditEventInTransaction(db, event);
    }

    return persistAuditEvent(event);
  };

  const executeSystemAdminCommand = <TInput extends SystemAdminCommand>(
    options: SystemAdminExecutionOptions<TInput>,
    context: SystemAdminScope
  ): Promise<SystemAdminMutationResult> => {
    const requestId = context.requestId ?? createId();
    const operationId = context.operationId ?? requestId;
    const pipeline = createPipeline<TInput, SystemAdminMutationResult>({
      executeDomainOperation: async ({
        input,
        actor,
        tenant,
      }: ExecutionMutationContext<TInput>): Promise<
        ExecutionDomainResult<SystemAdminMutationResult>
      > => {
        if (options.resource === "system-admin.tenant-settings") {
          const settingUpdate = input as TenantAdminSettingUpdate;
          const branding = await persistTenantAdminSetting(
            tenant.tenantId,
            settingUpdate
          );

          if (
            settingUpdate.key === "theme-preset" ||
            settingUpdate.key === "tenant-branding"
          ) {
            setTenantBranding(tenant.tenantId, branding);
          }
        }

        const result = buildMutationResult(
          options.action,
          tenant.tenantId,
          options.summary,
          createId
        );

        return {
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
        };
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
      requirePermission: requirePermissionHook,
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

  return {
    executeTenantAdminSettingUpdate: (
      input: TenantAdminSettingUpdate,
      context: SystemAdminScope
    ): Promise<SystemAdminMutationResult> =>
      executeSystemAdminCommand(
        {
          action: tenantSettingsCapabilities.tenantSettingsWrite,
          input,
          permission: tenantSettingsCapabilities.tenantSettingsWrite,
          reason: input.reason,
          resource: "system-admin.tenant-settings",
          schema: tenantAdminSettingUpdateSchema,
          summary: `Accepted tenant admin setting update for ${input.key}.`,
          targetId: input.key,
          targetType: "tenant-admin-setting",
        },
        context
      ),
    executeRoleAssignment: (
      input: RoleAssignmentCommand,
      context: SystemAdminScope
    ): Promise<SystemAdminMutationResult> =>
      executeSystemAdminCommand(
        {
          action: accessCapabilities.usersAccessWrite,
          input,
          permission: accessCapabilities.usersAccessWrite,
          reason: input.reason,
          resource: "system-admin.users-access",
          schema: roleAssignmentCommandSchema,
          summary: `Accepted role assignment ${input.roleKey}.`,
          targetId: input.targetUserId,
          targetType: "user-role-assignment",
        },
        context
      ),
    executeCustomizationPublication: (
      input: CustomizationGovernanceCommand,
      context: SystemAdminScope
    ): Promise<SystemAdminMutationResult> =>
      executeSystemAdminCommand(
        {
          action: customizationCapabilities.customizationPublish,
          input,
          permission: customizationCapabilities.customizationPublish,
          reason: input.reason,
          resource: "system-admin.customization",
          schema: customizationGovernanceCommandSchema,
          summary: "Accepted governed customization publication.",
          targetId: input.customizationId,
          targetType: "tenant-customization",
        },
        context
      ),
  };
};

const defaultExecutionHandlers = createSystemAdminExecutionHandlers();

export const executeTenantAdminSettingUpdate =
  defaultExecutionHandlers.executeTenantAdminSettingUpdate;
export const executeRoleAssignment =
  defaultExecutionHandlers.executeRoleAssignment;
export const executeCustomizationPublication =
  defaultExecutionHandlers.executeCustomizationPublication;
