import {
  createCareerPathingDevelopmentPlans,
  getCareerPathingDevelopmentPlans,
  listCareerPathingDevelopmentPlans,
  updateCareerPathingDevelopmentPlans,
} from "../server.ts";

export const careerPathingDevelopmentPlansExecutionSurface = {
  create: createCareerPathingDevelopmentPlans,
  getById: getCareerPathingDevelopmentPlans,
  list: listCareerPathingDevelopmentPlans,
  update: updateCareerPathingDevelopmentPlans,
};
