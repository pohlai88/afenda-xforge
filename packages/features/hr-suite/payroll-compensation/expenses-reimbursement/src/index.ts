/**
 * Server-only public door for the feature package.
 *
 * This is an adoption scaffold generated from the legacy HR suite inventory.
 */
import "server-only";

export type {
  CreateExpensesReimbursementInput,
  ExpensesReimbursementRecord,
  ListExpensesReimbursementQuery,
  UpdateExpensesReimbursementInput,
} from "./contract.ts";
export { expensesReimbursementExecutionSurface } from "./execution/index.ts";
export { expensesReimbursementManifest } from "./manifest.ts";
export { expensesReimbursementMetadata } from "./metadata.ts";
export {
  createExpensesReimbursement,
  getExpensesReimbursement,
  listExpensesReimbursement,
  expensesReimbursementRouteContracts,
  updateExpensesReimbursement,
} from "./server.ts";
export { expensesReimbursementFeatureScope } from "./shared/index.ts";
