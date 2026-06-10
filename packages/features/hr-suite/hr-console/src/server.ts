import "server-only";

export {
  grantHrConsoleDelegation,
  listHrConsoleDelegationGrants,
  revokeHrConsoleDelegation,
  resolveHrConsoleLamCapabilities,
} from "./actions.ts";
export {
  executeGrantHrDelegation,
  executeRevokeHrDelegation,
} from "./execution/index.ts";
export {
  registerHrConsoleOpenApi,
  hrConsoleGrantDelegationRouteContract,
  hrConsoleListDelegationRouteContract,
  hrConsoleListSectionsRouteContract,
  hrConsoleReadOverviewRouteContract,
  hrConsoleRevokeDelegationRouteContract,
  hrConsoleRouteContracts,
} from "./contract.ts";
export {
  grantHrDelegation,
  listHrDelegationGrants,
  listHrDelegationGrantSnapshots,
  revokeHrDelegation,
} from "./delegation.ts";
export {
  HR_CONSOLE_ID,
  resolveModuleConsoleAccess,
  resolveModuleConsoleGovernanceMode,
} from "./governance.ts";
export {
  lamAttendancePolicyConfigLinks,
  lamCalendarConfigLinks,
  lamEncashmentConfigLinks,
  lamLeaveConfigLinks,
  listHrConsoleSections,
  readHrConsoleOverview,
} from "./queries.ts";
export type { HrConsoleScope } from "./schema.ts";
