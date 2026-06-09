import {
  createPerformanceAppraisals,
  getPerformanceAppraisals,
  listPerformanceAppraisals,
  updatePerformanceAppraisals,
} from "../server.ts";

export const performanceAppraisalsExecutionSurface = {
  create: createPerformanceAppraisals,
  getById: getPerformanceAppraisals,
  list: listPerformanceAppraisals,
  update: updatePerformanceAppraisals,
};
