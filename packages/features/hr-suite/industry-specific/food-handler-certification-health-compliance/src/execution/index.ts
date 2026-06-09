import {
  createFoodHandlerCertificationHealthCompliance,
  getFoodHandlerCertificationHealthCompliance,
  listFoodHandlerCertificationHealthCompliance,
  updateFoodHandlerCertificationHealthCompliance,
} from "../server.ts";

export const foodHandlerCertificationHealthComplianceExecutionSurface = {
  create: createFoodHandlerCertificationHealthCompliance,
  getById: getFoodHandlerCertificationHealthCompliance,
  list: listFoodHandlerCertificationHealthCompliance,
  update: updateFoodHandlerCertificationHealthCompliance,
};
