import {
  createFieldWorkerRemoteWorkforceManagement,
  getFieldWorkerRemoteWorkforceManagement,
  listFieldWorkerRemoteWorkforceManagement,
  updateFieldWorkerRemoteWorkforceManagement,
} from "../server.ts";

export const fieldWorkerRemoteWorkforceManagementExecutionSurface = {
  create: createFieldWorkerRemoteWorkforceManagement,
  getById: getFieldWorkerRemoteWorkforceManagement,
  list: listFieldWorkerRemoteWorkforceManagement,
  update: updateFieldWorkerRemoteWorkforceManagement,
};
