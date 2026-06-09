import "server-only";

import type { DocumentsManagementPolicyContext } from "../policy.ts";
import { requireDocumentsManagementWriteAccess } from "../policy.ts";

export const runHrSuiteFeatureAction = <T>(
  operation: () => T,
  context?: DocumentsManagementPolicyContext
): T => {
  requireDocumentsManagementWriteAccess(context);
  return operation();
};
