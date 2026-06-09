/**
 * Server-only public door for ERP orchestration support.
 */
import "server-only";

export { createIntegrationFlow, runIntegrationFlow } from "./flow.ts";
export {
  type HrSuiteFeaturePackage,
  hrSuiteFeatureDomains,
  hrSuiteFeaturePackages,
  listHrSuiteFeaturePackagesByDomain,
} from "./hr-suite/index.ts";
export {
  BaseMasterDataService,
  type BulkOperation,
  type BulkResult,
  type ChangeRecord,
  type EntityList,
  type MasterDataEntity,
  MasterDataError,
  type MasterDataQuery,
  type SyncAction,
  type SyncConflict,
  type SyncEvent,
  type SyncResult,
} from "./master-data/index.ts";
export type {
  IntegrationFlow,
  IntegrationFlowResult,
  IntegrationStep,
} from "./types.ts";
