import "server-only";

import { executeTenantAdminSettingUpdate } from "../../execution/index.ts";
import type {
  SystemAdminMutationResult,
  SystemAdminScope,
  TenantAdminSettingUpdate,
} from "../../schema.ts";

export const updateTenantAdminSetting = (
  input: TenantAdminSettingUpdate,
  context: SystemAdminScope
): Promise<SystemAdminMutationResult> =>
  executeTenantAdminSettingUpdate(input, context);
