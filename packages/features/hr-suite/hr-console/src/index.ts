import "server-only";

export {
  grantHrConsoleDelegation,
  listHrConsoleDelegationGrants,
  revokeHrConsoleDelegation,
} from "./actions.ts";
export {
  hrConsoleCapabilities,
  hrConsoleFeatureScope,
  hrConsoleOperatorCapabilities,
} from "./feature-scope.ts";
export {
  HR_CONSOLE_ID,
  resolveModuleConsoleAccess,
  resolveModuleConsoleGovernanceMode,
} from "./governance.ts";
export { hrConsoleFeatureManifest, hrConsoleModuleRegistration } from "./manifest.ts";
export { hrConsoleMetadata } from "./metadata.ts";
export {
  lamAttendancePolicyConfigLinks,
  lamCalendarConfigLinks,
  lamEncashmentConfigLinks,
  lamLeaveConfigLinks,
  listHrConsoleSections,
  readHrConsoleOverview,
} from "./queries.ts";
export type {
  GrantHrDelegationCommand,
  HrConsoleOverview,
  HrConsoleScope,
  HrConsoleSection,
  HrDelegationGrant,
  ModuleConsoleGovernanceMode,
  ResolvedModuleConsoleAccess,
  RevokeHrDelegationCommand,
} from "./schema.ts";
