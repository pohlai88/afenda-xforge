import "server-only";

export {
  assignSystemAdminRole,
  assignModuleConsoleOperatorForSystemAdmin,
  publishSystemAdminCustomization,
  revokeModuleConsoleOperatorForSystemAdmin,
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
  systemAdminAssignModuleConsoleOperatorRouteContract,
  systemAdminListModuleConsoleOperatorsRouteContract,
  systemAdminListModuleConsolesRouteContract,
  systemAdminRevokeModuleConsoleOperatorRouteContract,
} from "./contract.ts";
export {
  bootstrapModuleConsoleRegistry,
  findRegisteredModuleConsole,
  listRegisteredModuleConsoles,
  resolveDefaultModuleConsoleOperatorCapabilities,
  resetModuleConsoleRegistryForTests,
  type ModuleConsoleRegistration,
} from "./module-console-registry.ts";
export {
  assignModuleConsoleOperator,
  hasActiveModuleConsoleOperator,
  listActiveModuleConsoleOperatorAssignmentsForScope,
  listModuleConsoleOperatorAssignments,
  resolveModuleConsoleOperatorAssignmentsForActor,
  revokeModuleConsoleOperator,
  type AssignModuleConsoleOperatorInput,
  type ModuleConsoleOperatorAssignment,
  type RevokeModuleConsoleOperatorInput,
} from "./module-console-operators.ts";
export {
  executeAssignModuleConsoleOperator,
  executeRevokeModuleConsoleOperator,
} from "./execution/module-console-operators.ts";
export {
  listModuleConsoleOperatorAssignmentsForSystemAdmin,
  listRegisteredModuleConsolesForSystemAdmin,
  listSystemAdminSections,
  readSystemAdminOverview,
} from "./queries.ts";
export type {
  SystemAdminWebhookEndpoint,
  UpsertSystemAdminWebhookEndpointInput,
} from "./webhook-endpoints.ts";
export {
  listSystemAdminWebhookEndpoints,
  upsertSystemAdminWebhookEndpoint,
} from "./webhook-endpoints.ts";
