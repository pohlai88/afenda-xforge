import {
  createOvertimeManagement,
  getOvertimeManagement,
  listOvertimeManagement,
  updateOvertimeManagement,
} from "../server.ts";

export type OvertimeManagementExecutionSurface = {
  create: typeof createOvertimeManagement;
  getById: typeof getOvertimeManagement;
  list: typeof listOvertimeManagement;
  update: typeof updateOvertimeManagement;
};

export const overtimeManagementExecutionSurface: OvertimeManagementExecutionSurface =
  {
    create: createOvertimeManagement,
    getById: getOvertimeManagement,
    list: listOvertimeManagement,
    update: updateOvertimeManagement,
  };
