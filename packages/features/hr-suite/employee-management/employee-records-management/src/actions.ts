import "server-only";

import {
  archiveHrEmployeeRecordAction,
  createHrEmployeeRecordAction,
  recordHrEmployeeAssignmentAction,
  rehireHrEmployeeAction,
  updateHrEmployeeRecordAction,
} from "./actions.server.ts";
import { runHrSuiteFeatureAction } from "./execution/action.ts";

export const archiveHrEmployeeRecord = (
  ...args: Parameters<typeof archiveHrEmployeeRecordAction>
): ReturnType<typeof archiveHrEmployeeRecordAction> =>
  runHrSuiteFeatureAction(() => archiveHrEmployeeRecordAction(...args));

export const createHrEmployeeRecord = (
  ...args: Parameters<typeof createHrEmployeeRecordAction>
): ReturnType<typeof createHrEmployeeRecordAction> =>
  runHrSuiteFeatureAction(() => createHrEmployeeRecordAction(...args));

export const recordHrEmployeeAssignment = (
  ...args: Parameters<typeof recordHrEmployeeAssignmentAction>
): ReturnType<typeof recordHrEmployeeAssignmentAction> =>
  runHrSuiteFeatureAction(() => recordHrEmployeeAssignmentAction(...args));

export const rehireHrEmployeeRecord = (
  ...args: Parameters<typeof rehireHrEmployeeAction>
): ReturnType<typeof rehireHrEmployeeAction> =>
  runHrSuiteFeatureAction(() => rehireHrEmployeeAction(...args));

export const updateHrEmployeeRecord = (
  ...args: Parameters<typeof updateHrEmployeeRecordAction>
): ReturnType<typeof updateHrEmployeeRecordAction> =>
  runHrSuiteFeatureAction(() => updateHrEmployeeRecordAction(...args));
