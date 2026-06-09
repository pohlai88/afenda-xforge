import {
  createAbsenceAnalyticsTrends,
  getAbsenceAnalyticsTrends,
  listAbsenceAnalyticsTrends,
  updateAbsenceAnalyticsTrends,
} from "../server.ts";

export type AbsenceAnalyticsTrendsExecutionSurface = {
  create: typeof createAbsenceAnalyticsTrends;
  getById: typeof getAbsenceAnalyticsTrends;
  list: typeof listAbsenceAnalyticsTrends;
  update: typeof updateAbsenceAnalyticsTrends;
};

export const absenceAnalyticsTrendsExecutionSurface: AbsenceAnalyticsTrendsExecutionSurface =
  {
    create: createAbsenceAnalyticsTrends,
    getById: getAbsenceAnalyticsTrends,
    list: listAbsenceAnalyticsTrends,
    update: updateAbsenceAnalyticsTrends,
  };
