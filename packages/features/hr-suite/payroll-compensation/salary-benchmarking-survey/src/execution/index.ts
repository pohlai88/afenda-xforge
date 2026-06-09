import {
  createSalaryBenchmarkingSurvey,
  getSalaryBenchmarkingSurvey,
  listSalaryBenchmarkingSurvey,
  updateSalaryBenchmarkingSurvey,
} from "../server.ts";

export const salaryBenchmarkingSurveyExecutionSurface = {
  create: createSalaryBenchmarkingSurvey,
  getById: getSalaryBenchmarkingSurvey,
  list: listSalaryBenchmarkingSurvey,
  update: updateSalaryBenchmarkingSurvey,
};
