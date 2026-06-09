import {
  createPayrollProcessing,
  getPayrollProcessing,
  listPayrollProcessing,
  updatePayrollProcessing,
} from "../server.ts";

export const payrollProcessingExecutionSurface = {
  create: createPayrollProcessing,
  getById: getPayrollProcessing,
  list: listPayrollProcessing,
  update: updatePayrollProcessing,
};
