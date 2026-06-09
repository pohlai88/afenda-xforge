import "server-only";

export {
  assignSystemAdminRole,
  publishSystemAdminCustomization,
  updateTenantAdminSetting,
} from "./actions.ts";
export {
  registerSystemAdminOpenApi,
  systemAdminCapabilities,
  systemAdminRouteContracts,
} from "./contract.ts";
export { systemAdminControlPlaneFeatureManifest } from "./manifest.ts";
export { systemAdminControlPlaneMetadata } from "./metadata.ts";
export {
  listSystemAdminSections,
  readSystemAdminOverview,
} from "./queries.ts";
export type {
  CustomizationGovernanceCommand,
  ListSystemAdminSectionsQuery,
  RoleAssignmentCommand,
  SystemAdminCapability,
  SystemAdminDomain,
  SystemAdminMutationResult,
  SystemAdminOverview,
  SystemAdminScope,
  SystemAdminSection,
  TenantAdminSettingUpdate,
} from "./schema.ts";
export type {
  SystemAdminWebhookEndpoint,
  UpsertSystemAdminWebhookEndpointInput,
} from "./webhook-endpoints.ts";
export {
  listSystemAdminWebhookEndpoints,
  upsertSystemAdminWebhookEndpoint,
} from "./webhook-endpoints.ts";
