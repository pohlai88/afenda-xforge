import "server-only";

import {
  executeAssignModuleConsoleOperator,
  executeRevokeModuleConsoleOperator,
} from "./execution/module-console-operators.ts";
import {
  executeCustomizationPublication,
  executeRoleAssignment,
  executeTenantAdminSettingUpdate,
} from "./execution/index.ts";
import type {
  AssignModuleConsoleOperatorCommand,
  CustomizationGovernanceCommand,
  RevokeModuleConsoleOperatorCommand,
  RoleAssignmentCommand,
  SystemAdminMutationResult,
  SystemAdminScope,
  TenantAdminSettingUpdate,
} from "./schema.ts";

export const updateTenantAdminSetting = (
  input: TenantAdminSettingUpdate,
  context: SystemAdminScope
): Promise<SystemAdminMutationResult> =>
  executeTenantAdminSettingUpdate(input, context);

export const assignSystemAdminRole = (
  input: RoleAssignmentCommand,
  context: SystemAdminScope
): Promise<SystemAdminMutationResult> => executeRoleAssignment(input, context);

export const publishSystemAdminCustomization = (
  input: CustomizationGovernanceCommand,
  context: SystemAdminScope
): Promise<SystemAdminMutationResult> =>
  executeCustomizationPublication(input, context);

export const assignModuleConsoleOperatorForSystemAdmin = (
  input: AssignModuleConsoleOperatorCommand,
  context: SystemAdminScope
) => executeAssignModuleConsoleOperator(input, context);

export const revokeModuleConsoleOperatorForSystemAdmin = (
  input: RevokeModuleConsoleOperatorCommand,
  context: SystemAdminScope
) => executeRevokeModuleConsoleOperator(input, context);
