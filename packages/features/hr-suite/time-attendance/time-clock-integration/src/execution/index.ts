import {
  createTimeClockIntegration,
  getTimeClockIntegration,
  listTimeClockIntegration,
  updateTimeClockIntegration,
} from "../server.ts";

export type TimeClockIntegrationExecutionSurface = {
  create: typeof createTimeClockIntegration;
  getById: typeof getTimeClockIntegration;
  list: typeof listTimeClockIntegration;
  update: typeof updateTimeClockIntegration;
};

export const timeClockIntegrationExecutionSurface: TimeClockIntegrationExecutionSurface =
  {
    create: createTimeClockIntegration,
    getById: getTimeClockIntegration,
    list: listTimeClockIntegration,
    update: updateTimeClockIntegration,
  };
