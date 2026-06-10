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
  systemAdminCapabilities,
  systemAdminRouteContracts,
} from "./contract.ts";
export { systemAdminControlPlaneFeatureManifest } from "./manifest.ts";
export { systemAdminControlPlaneMetadata } from "./metadata.ts";
export {
  bootstrapModuleConsoleRegistry,
  listRegisteredModuleConsoles,
  resetModuleConsoleRegistryForTests,
  type ModuleConsoleRegistration,
} from "./module-console-registry.ts";
export {
  hasActiveModuleConsoleOperator,
  type ModuleConsoleOperatorAssignment,
} from "./module-console-operators.ts";
export {
  listModuleConsoleOperatorAssignmentsForSystemAdmin,
  listRegisteredModuleConsolesForSystemAdmin,
  listSystemAdminSections,
  readSystemAdminOverview,
} from "./queries.ts";
export type {
  AssignModuleConsoleOperatorCommand,
  CustomizationGovernanceCommand,
  ListModuleConsoleOperatorAssignmentsQuery,
  ListSystemAdminSectionsQuery,
  ModuleConsoleOperatorAssignmentView,
  ModuleConsoleRegistrationView,
  RevokeModuleConsoleOperatorCommand,
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
