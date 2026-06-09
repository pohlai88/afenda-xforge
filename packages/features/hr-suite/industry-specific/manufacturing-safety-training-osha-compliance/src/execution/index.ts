import {
  createManufacturingSafetyTrainingOshaCompliance,
  getManufacturingSafetyTrainingOshaCompliance,
  listManufacturingSafetyTrainingOshaCompliance,
  updateManufacturingSafetyTrainingOshaCompliance,
} from "../server.ts";

export const manufacturingSafetyTrainingOshaComplianceExecutionSurface = {
  create: createManufacturingSafetyTrainingOshaCompliance,
  getById: getManufacturingSafetyTrainingOshaCompliance,
  list: listManufacturingSafetyTrainingOshaCompliance,
  update: updateManufacturingSafetyTrainingOshaCompliance,
};
