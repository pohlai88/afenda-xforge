import "server-only";

export {
  archiveHrEmployeeRecord,
  createHrEmployeeRecord,
  recordHrEmployeeAssignment,
  rehireHrEmployeeRecord,
  updateHrEmployeeRecord,
} from "./actions.ts";
export {
  buildHrEmployeeRecordDetailPageModel,
  buildHrEmployeeRecordExportPageModel,
} from "./detail-page-model.server.ts";
export { buildHrRecordsPageModel } from "./page-model.server.ts";
export { listHrEmployeeAssignments } from "./queries/assignments.query.ts";
export {
  listHrEmployeeRecordSummaries,
  listHrEmployeeRecordSummariesPage,
} from "./queries/records.query.ts";
export { listHrEmployeeStatusHistory } from "./queries/status-history.query.ts";
export {
  getHrEmployeeRecord,
  listHrEmployeeRecords,
} from "./queries.server.ts";
export {
  deactivateEmployeeUserAccountLink,
  listEmployeeUserAccountLinks,
  upsertEmployeeUserAccountLink,
} from "./actions/employee-user-link.action.ts";
export type { EmployeeUserAccountLinkContext } from "./actions/employee-user-link.action.ts";
export {
  resolveAuthUserIdByEmployeeId,
  resolveEmployeeIdByAuthUserId,
  resetEmployeeUserAccountLinksForTests,
  resetEmployeeUserAccountRepositoryPathForTesting,
  seedEmployeeUserAccountLinkForTests,
  setEmployeeUserAccountRepositoryPathForTesting,
} from "./queries/employee-user-link.query.ts";
export {
  buildHrEmployeeIntegrationChangeEvent,
  buildHrEmployeeIntegrationSnapshot,
} from "./registry/integration.ts";
export {
  hasHrEmployeeRecordsSearch,
  searchHrEmployeeRecords,
  syncAllHrEmployeeRecordsSearchDocuments,
} from "./search.ts";
