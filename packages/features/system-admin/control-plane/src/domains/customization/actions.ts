import "server-only";

import { executeCustomizationPublication } from "../../execution/index.ts";
import type {
  CustomizationGovernanceCommand,
  SystemAdminMutationResult,
  SystemAdminScope,
} from "../../schema.ts";

export const publishSystemAdminCustomization = (
  input: CustomizationGovernanceCommand,
  context: SystemAdminScope
): Promise<SystemAdminMutationResult> =>
  executeCustomizationPublication(input, context);
