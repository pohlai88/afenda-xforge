import "server-only";

export {
  assignSystemAdminRole,
  publishSystemAdminCustomization,
  updateTenantAdminSetting,
} from "./actions.ts";
export {
  registerSystemAdminOpenApi,
  systemAdminAssignRoleRouteContract,
  systemAdminListSectionsRouteContract,
  systemAdminOpenApiSchemas,
  systemAdminPublishCustomizationRouteContract,
  systemAdminReadOverviewRouteContract,
  systemAdminRouteContracts,
  systemAdminUpdateTenantSettingRouteContract,
} from "./contract.ts";
export {
  readTenantAdminSettingsForTenant,
  readTenantBrandingForTenant,
} from "./domains/tenant-settings/queries.ts";
export type { TenantAdminSettingsSnapshot } from "./domains/tenant-settings/repository.server.ts";
export {
  listSystemAdminSections,
  readSystemAdminOverview,
  reviewSystemAdminCustomizationImport,
} from "./queries.ts";
export type {
  SystemAdminWebhookEndpoint,
  SystemAdminWebhookEndpointServiceDependencies,
  UpsertSystemAdminWebhookEndpointInput,
} from "./webhook-endpoints.ts";
export {
  createSystemAdminWebhookEndpointService,
  listSystemAdminWebhookEndpoints,
  upsertSystemAdminWebhookEndpoint,
} from "./webhook-endpoints.ts";
