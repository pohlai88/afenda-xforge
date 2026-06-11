import "server-only";

export {
  bindKeyboardShortcutsAuth,
  type KeyboardShortcutsAuthBindings,
} from "./auth-bindings.server.ts";
export {
  executeTenantKeyboardShortcutPolicyUpdate,
  executeUserShortcutOverridesUpdate,
  type ExecuteUserShortcutOverridesInput,
  type TenantKeyboardShortcutMutationScope,
  type UserShortcutMutationScope,
} from "./execution.server.ts";
export { registerWorkspaceShortcutsOpenApi } from "./openapi.server.ts";
export {
  queryTenantKeyboardShortcutPolicy,
  queryWorkspaceShortcuts,
  type TenantKeyboardShortcutPolicyQueryScope,
  type WorkspaceShortcutsQueryScope,
} from "./queries.server.ts";
export {
  readTenantKeyboardShortcutPolicy,
  readWorkspaceShortcuts,
  upsertTenantKeyboardShortcutPolicy,
  upsertUserShortcutOverrides,
} from "./repository.server.ts";
export { DEFAULT_TENANT_SHORTCUT_POLICY } from "./policy.server.ts";
