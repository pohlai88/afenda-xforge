import {
  createShiftScheduling,
  getShiftScheduling,
  listShiftScheduling,
  updateShiftScheduling,
} from "../server.ts";

export type ShiftSchedulingExecutionSurface = {
  create: typeof createShiftScheduling;
  getById: typeof getShiftScheduling;
  list: typeof listShiftScheduling;
  update: typeof updateShiftScheduling;
};

export const shiftSchedulingExecutionSurface: ShiftSchedulingExecutionSurface =
  {
    create: createShiftScheduling,
    getById: getShiftScheduling,
    list: listShiftScheduling,
    update: updateShiftScheduling,
  };
