import "server-only";

import { executeRoleAssignment } from "../../execution/index.ts";
import type {
  RoleAssignmentCommand,
  SystemAdminMutationResult,
  SystemAdminScope,
} from "../../schema.ts";

export const assignSystemAdminRole = (
  input: RoleAssignmentCommand,
  context: SystemAdminScope
): Promise<SystemAdminMutationResult> => executeRoleAssignment(input, context);
