import "server-only";

import {
  executeCustomizationPublication,
  executeRoleAssignment,
  executeTenantAdminSettingUpdate,
} from "./execution/index.ts";
import type {
  CustomizationGovernanceCommand,
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
