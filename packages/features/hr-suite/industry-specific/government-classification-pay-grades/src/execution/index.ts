import {
  createGovernmentClassificationPayGrades,
  getGovernmentClassificationPayGrades,
  listGovernmentClassificationPayGrades,
  updateGovernmentClassificationPayGrades,
} from "../server.ts";

export const governmentClassificationPayGradesExecutionSurface = {
  create: createGovernmentClassificationPayGrades,
  getById: getGovernmentClassificationPayGrades,
  list: listGovernmentClassificationPayGrades,
  update: updateGovernmentClassificationPayGrades,
};
