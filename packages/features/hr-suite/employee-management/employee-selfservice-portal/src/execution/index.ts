import {
  createEmployeeSelfservicePortal,
  getEmployeeSelfservicePortal,
  listEmployeeSelfservicePortal,
  updateEmployeeSelfservicePortal,
} from "../server.ts";

export type EmployeeSelfservicePortalExecutionSurface = {
  create: typeof createEmployeeSelfservicePortal;
  getById: typeof getEmployeeSelfservicePortal;
  list: typeof listEmployeeSelfservicePortal;
  update: typeof updateEmployeeSelfservicePortal;
};

export const employeeSelfservicePortalExecutionSurface: EmployeeSelfservicePortalExecutionSurface =
  {
    create: createEmployeeSelfservicePortal,
    getById: getEmployeeSelfservicePortal,
    list: listEmployeeSelfservicePortal,
    update: updateEmployeeSelfservicePortal,
  };
