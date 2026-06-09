import "server-only";

export {
  createLearningManagementSystemLmsRecord as createLearningManagementSystemLms,
  updateLearningManagementSystemLmsRecord as updateLearningManagementSystemLms,
} from "./actions.ts";
export { learningManagementSystemLmsRouteContracts } from "./contract.ts";
export {
  getLearningManagementSystemLmsRecord as getLearningManagementSystemLms,
  listLearningManagementSystemLmsRecords as listLearningManagementSystemLms,
} from "./queries.ts";
