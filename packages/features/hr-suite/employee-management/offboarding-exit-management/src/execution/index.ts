import {
  createOffboardingExitManagement,
  getOffboardingExitManagement,
  listOffboardingExitManagement,
  updateOffboardingExitManagement,
} from "../server.ts";

export type OffboardingExitManagementExecutionSurface = {
  create: typeof createOffboardingExitManagement;
  getById: typeof getOffboardingExitManagement;
  list: typeof listOffboardingExitManagement;
  update: typeof updateOffboardingExitManagement;
};

export const offboardingExitManagementExecutionSurface: OffboardingExitManagementExecutionSurface =
  {
    create: createOffboardingExitManagement,
    getById: getOffboardingExitManagement,
    list: listOffboardingExitManagement,
    update: updateOffboardingExitManagement,
  };
