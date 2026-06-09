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
  listSystemAdminSections,
  readSystemAdminOverview,
} from "./queries.ts";
