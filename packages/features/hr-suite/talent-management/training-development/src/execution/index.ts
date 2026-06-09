import {
  createTrainingDevelopment,
  getTrainingDevelopment,
  listTrainingDevelopment,
  updateTrainingDevelopment,
} from "../server.ts";

export const trainingDevelopmentExecutionSurface = {
  create: createTrainingDevelopment,
  getById: getTrainingDevelopment,
  list: listTrainingDevelopment,
  update: updateTrainingDevelopment,
};
