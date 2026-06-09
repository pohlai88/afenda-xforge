import {
  createEmployeeLifecycleManagement,
  getEmployeeLifecycleManagement,
  listEmployeeLifecycleManagement,
  updateEmployeeLifecycleManagement,
} from "../server.ts";

export type EmployeeLifecycleManagementExecutionSurface = {
  create: typeof createEmployeeLifecycleManagement;
  getById: typeof getEmployeeLifecycleManagement;
  list: typeof listEmployeeLifecycleManagement;
  update: typeof updateEmployeeLifecycleManagement;
};

export const employeeLifecycleManagementExecutionSurface: EmployeeLifecycleManagementExecutionSurface =
  {
    create: createEmployeeLifecycleManagement,
    getById: getEmployeeLifecycleManagement,
    list: listEmployeeLifecycleManagement,
    update: updateEmployeeLifecycleManagement,
  };
