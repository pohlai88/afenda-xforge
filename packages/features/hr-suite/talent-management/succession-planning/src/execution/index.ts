import {
  createSuccessionPlanning,
  getSuccessionPlanning,
  listSuccessionPlanning,
  updateSuccessionPlanning,
} from "../server.ts";

export const successionPlanningExecutionSurface = {
  create: createSuccessionPlanning,
  getById: getSuccessionPlanning,
  list: listSuccessionPlanning,
  update: updateSuccessionPlanning,
};
