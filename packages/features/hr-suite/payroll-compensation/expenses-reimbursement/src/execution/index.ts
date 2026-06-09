import {
  createExpensesReimbursement,
  getExpensesReimbursement,
  listExpensesReimbursement,
  updateExpensesReimbursement,
} from "../server.ts";

export const expensesReimbursementExecutionSurface = {
  create: createExpensesReimbursement,
  getById: getExpensesReimbursement,
  list: listExpensesReimbursement,
  update: updateExpensesReimbursement,
};
