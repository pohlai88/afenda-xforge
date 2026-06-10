import {
  getOffboardingCaseById,
  listOffboardingCases,
  openOffboardingCase,
  updateOffboardingCase,
} from "../server.ts";

export { runOffboardingExitManagementAction } from "../execution.ts";

export type OffboardingExitManagementExecutionSurface = {
  getById: typeof getOffboardingCaseById;
  list: typeof listOffboardingCases;
  openCase: typeof openOffboardingCase;
  updateCase: typeof updateOffboardingCase;
};

export const offboardingExitManagementExecutionSurface: OffboardingExitManagementExecutionSurface =
  {
    getById: getOffboardingCaseById,
    list: listOffboardingCases,
    openCase: openOffboardingCase,
    updateCase: updateOffboardingCase,
  };
