import "server-only";

import type { HrSuiteFeatureContext } from "./feature-scope.ts";

export type OffboardingMutationContext = HrSuiteFeatureContext;

export const runOffboardingExitManagementAction = async <T>(
  operation: () => Promise<T> | T
): Promise<T> => await operation();
