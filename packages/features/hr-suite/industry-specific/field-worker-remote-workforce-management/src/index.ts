/**
 * Server-only public door for the feature package.
 *
 * This is an adoption scaffold generated from the legacy HR suite inventory.
 */
import "server-only";

export type {
  CreateFieldWorkerRemoteWorkforceManagementInput,
  FieldWorkerRemoteWorkforceManagementRecord,
  ListFieldWorkerRemoteWorkforceManagementQuery,
  UpdateFieldWorkerRemoteWorkforceManagementInput,
} from "./contract.ts";
export { fieldWorkerRemoteWorkforceManagementExecutionSurface } from "./execution/index.ts";
export { fieldWorkerRemoteWorkforceManagementManifest } from "./manifest.ts";
export { fieldWorkerRemoteWorkforceManagementMetadata } from "./metadata.ts";
export {
  createFieldWorkerRemoteWorkforceManagement,
  fieldWorkerRemoteWorkforceManagementRouteContracts,
  getFieldWorkerRemoteWorkforceManagement,
  listFieldWorkerRemoteWorkforceManagement,
  updateFieldWorkerRemoteWorkforceManagement,
} from "./server.ts";
export { fieldWorkerRemoteWorkforceManagementFeatureScope } from "./shared/index.ts";
