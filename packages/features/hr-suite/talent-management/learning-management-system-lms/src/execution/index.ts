import {
  createLearningManagementSystemLms,
  getLearningManagementSystemLms,
  listLearningManagementSystemLms,
  updateLearningManagementSystemLms,
} from "../server.ts";

export const learningManagementSystemLmsExecutionSurface = {
  create: createLearningManagementSystemLms,
  getById: getLearningManagementSystemLms,
  list: listLearningManagementSystemLms,
  update: updateLearningManagementSystemLms,
};
