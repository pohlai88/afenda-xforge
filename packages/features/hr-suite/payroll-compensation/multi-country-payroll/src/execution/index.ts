import {
  createMultiCountryPayroll,
  getMultiCountryPayroll,
  listMultiCountryPayroll,
  updateMultiCountryPayroll,
} from "../server.ts";

export const multiCountryPayrollExecutionSurface = {
  create: createMultiCountryPayroll,
  getById: getMultiCountryPayroll,
  list: listMultiCountryPayroll,
  update: updateMultiCountryPayroll,
};
