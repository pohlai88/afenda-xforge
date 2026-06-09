import {
  createCompensationPlanningModeling,
  getCompensationPlanningModeling,
  listCompensationPlanningModeling,
  updateCompensationPlanningModeling,
} from "../server.ts";

export const compensationPlanningModelingExecutionSurface = {
  create: createCompensationPlanningModeling,
  getById: getCompensationPlanningModeling,
  list: listCompensationPlanningModeling,
  update: updateCompensationPlanningModeling,
};
