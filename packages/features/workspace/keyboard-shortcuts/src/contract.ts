export type ShortcutActionId =
  | "workspace.commandSearch"
  | "workspace.openShortcutHelp"
  | "workspace.toggleSidebar"
  | "crud.create"
  | "crud.edit"
  | "crud.save"
  | "crud.delete"
  | "crud.cancel";

export type ShortcutGroup = "navigation" | "crud" | "help";

export type ShortcutScope = "global" | "workspace" | "crud" | "grid" | "dialog";

export type ShortcutSource = "product" | "tenant" | "user";

export type ShortcutReliabilityTier = "high" | "medium" | "low";

export type ShortcutBinding = {
  key: string;
  label: string;
  normalized: string;
};

export type ProductShortcutDefinition = {
  actionId: ShortcutActionId;
  defaultBinding: ShortcutBinding;
  secondaryBinding?: ShortcutBinding;
  group: ShortcutGroup;
  scope: ShortcutScope;
  locked: boolean;
  description: string;
  reliability: ShortcutReliabilityTier;
  browserConflict?: boolean;
};

export type ShortcutPolicy = {
  allowUserCustomize: boolean;
  allowFnKeyBindings: boolean;
  lockedActions: ShortcutActionId[];
};

export type ResolvedShortcut = {
  actionId: ShortcutActionId;
  binding: ShortcutBinding;
  secondaryBinding?: ShortcutBinding;
  group: ShortcutGroup;
  scope: ShortcutScope;
  locked: boolean;
  source: ShortcutSource;
  description: string;
  reliability: ShortcutReliabilityTier;
  browserConflict?: boolean;
};

export type ShortcutOverrides = Partial<Record<ShortcutActionId, string>>;

export type WorkspaceShortcutsPayload = {
  bindings: Record<ShortcutActionId, ResolvedShortcut>;
  policy: ShortcutPolicy;
  source: Record<ShortcutActionId, ShortcutSource>;
  layers: {
    tenant: ShortcutOverrides;
    user: ShortcutOverrides;
  };
};

export type TenantKeyboardShortcutPolicySnapshot = {
  allowUserCustomize: boolean;
  allowFnKeyBindings: boolean;
  lockedActions: ShortcutActionId[];
  overrides: ShortcutOverrides;
};

export type TenantKeyboardShortcutPolicyPayload = {
  policy: TenantKeyboardShortcutPolicySnapshot;
  preview: WorkspaceShortcutsPayload;
};

export const WORKSPACE_KEYBOARD_SHORTCUTS_BROADCAST_CHANNEL =
  "xforge:workspace-keyboard-shortcuts";

export type ShortcutOverridePatch = Partial<
  Record<ShortcutActionId, string | null>
>;

export type FocusedShortcutTargetType = "record" | "cell" | "surface" | "form";

export type FocusedShortcutTarget = {
  targetId: string;
  targetType: FocusedShortcutTargetType;
  handlers: Partial<Record<ShortcutActionId, () => void>>;
};

export const SHORTCUT_ACTION_IDS = [
  "workspace.commandSearch",
  "workspace.openShortcutHelp",
  "workspace.toggleSidebar",
  "crud.create",
  "crud.edit",
  "crud.save",
  "crud.delete",
  "crud.cancel",
] as const satisfies readonly ShortcutActionId[];

export const GLOBAL_ALLOWED_IN_TEXT_ENTRY = new Set<ShortcutActionId>([
  "workspace.commandSearch",
  "workspace.openShortcutHelp",
]);

export const CRUD_SHORTCUT_ACTIONS = new Set<ShortcutActionId>([
  "crud.create",
  "crud.edit",
  "crud.save",
  "crud.delete",
  "crud.cancel",
]);

export const DEFAULT_ACTIVE_SHORTCUT_SCOPES: readonly ShortcutScope[] = [
  "crud",
  "grid",
  "workspace",
  "global",
];

export const isShortcutActionId = (value: string): value is ShortcutActionId =>
  (SHORTCUT_ACTION_IDS as readonly string[]).includes(value);
