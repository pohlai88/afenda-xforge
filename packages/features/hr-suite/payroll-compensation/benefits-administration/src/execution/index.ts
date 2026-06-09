import {
  createBenefitsAdministration,
  getBenefitsAdministration,
  listBenefitsAdministration,
  updateBenefitsAdministration,
} from "../server.ts";

export const benefitsAdministrationExecutionSurface = {
  create: createBenefitsAdministration,
  getById: getBenefitsAdministration,
  list: listBenefitsAdministration,
  update: updateBenefitsAdministration,
};
