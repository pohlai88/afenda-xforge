import {
  archiveHrEmployeeRecord,
  createHrEmployeeRecord,
  getHrEmployeeRecord,
  listHrEmployeeRecords,
  recordHrEmployeeAssignment,
  rehireHrEmployeeRecord,
  updateHrEmployeeRecord,
} from "../server.ts";

export type HrRecordsExecutionSurface = {
  archive: typeof archiveHrEmployeeRecord;
  assign: typeof recordHrEmployeeAssignment;
  create: typeof createHrEmployeeRecord;
  getById: typeof getHrEmployeeRecord;
  list: typeof listHrEmployeeRecords;
  rehire: typeof rehireHrEmployeeRecord;
  update: typeof updateHrEmployeeRecord;
};

export const hrRecordsExecutionSurface: HrRecordsExecutionSurface = {
  archive: archiveHrEmployeeRecord,
  assign: recordHrEmployeeAssignment,
  create: createHrEmployeeRecord,
  getById: getHrEmployeeRecord,
  list: listHrEmployeeRecords,
  rehire: rehireHrEmployeeRecord,
  update: updateHrEmployeeRecord,
};
