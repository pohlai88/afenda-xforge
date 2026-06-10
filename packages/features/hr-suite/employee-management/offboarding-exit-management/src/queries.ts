import "server-only";

import {
  getOffboardingCaseById,
  listOffboardingCases,
} from "./queries/index.ts";

export {
  getOffboardingCaseById,
  listOffboardingCases,
} from "./queries/index.ts";

export const listOffboardingExitManagementRecords = listOffboardingCases;

export const getOffboardingExitManagementRecord = getOffboardingCaseById;
