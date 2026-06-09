import {
  createLeaveAttendanceManagement,
  getLeaveAttendanceManagement,
  listLeaveAttendanceManagement,
  updateLeaveAttendanceManagement,
} from "../server.ts";

export type LeaveAttendanceManagementExecutionSurface = {
  create: typeof createLeaveAttendanceManagement;
  getById: typeof getLeaveAttendanceManagement;
  list: typeof listLeaveAttendanceManagement;
  update: typeof updateLeaveAttendanceManagement;
};

export const leaveAttendanceManagementExecutionSurface: LeaveAttendanceManagementExecutionSurface =
  {
    create: createLeaveAttendanceManagement,
    getById: getLeaveAttendanceManagement,
    list: listLeaveAttendanceManagement,
    update: updateLeaveAttendanceManagement,
  };
