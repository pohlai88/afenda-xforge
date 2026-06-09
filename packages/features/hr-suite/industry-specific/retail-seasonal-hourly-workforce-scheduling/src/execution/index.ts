import {
  createRetailSeasonalHourlyWorkforceScheduling,
  getRetailSeasonalHourlyWorkforceScheduling,
  listRetailSeasonalHourlyWorkforceScheduling,
  updateRetailSeasonalHourlyWorkforceScheduling,
} from "../server.ts";

export const retailSeasonalHourlyWorkforceSchedulingExecutionSurface = {
  create: createRetailSeasonalHourlyWorkforceScheduling,
  getById: getRetailSeasonalHourlyWorkforceScheduling,
  list: listRetailSeasonalHourlyWorkforceScheduling,
  update: updateRetailSeasonalHourlyWorkforceScheduling,
};
