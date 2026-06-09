import {
  createBonusIncentiveManagement,
  getBonusIncentiveManagement,
  listBonusIncentiveManagement,
  updateBonusIncentiveManagement,
} from "../server.ts";

export const bonusIncentiveManagementExecutionSurface = {
  create: createBonusIncentiveManagement,
  getById: getBonusIncentiveManagement,
  list: listBonusIncentiveManagement,
  update: updateBonusIncentiveManagement,
};
