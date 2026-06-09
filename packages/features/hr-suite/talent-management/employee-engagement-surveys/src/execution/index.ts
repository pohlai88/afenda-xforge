import {
  createEmployeeEngagementSurveys,
  getEmployeeEngagementSurveys,
  listEmployeeEngagementSurveys,
  updateEmployeeEngagementSurveys,
} from "../server.ts";

export const employeeEngagementSurveysExecutionSurface = {
  create: createEmployeeEngagementSurveys,
  getById: getEmployeeEngagementSurveys,
  list: listEmployeeEngagementSurveys,
  update: updateEmployeeEngagementSurveys,
};
