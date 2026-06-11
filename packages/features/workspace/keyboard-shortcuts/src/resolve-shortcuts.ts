import type {
  ResolvedShortcut,
  ShortcutActionId,
  ShortcutOverrides,
  ShortcutPolicy,
  ShortcutSource,
  WorkspaceShortcutsPayload,
} from "./contract.ts";
import { createBindingFromNormalized } from "./format-shortcut.ts";
import { bindingsMatch, isFnKeyBinding } from "./normalize-shortcut.ts";
import {
  getProductShortcutDefinition,
  PRODUCT_LOCKED_ACTIONS,
  PRODUCT_SHORTCUT_DEFINITIONS,
} from "./product-defaults.ts";

const RESERVED_BROWSER_KEYS = new Set(["f5", "f11", "f12"]);

export const isAllowedProductOverride = (
  actionId: ShortcutActionId,
  normalized: string
): boolean => {
  const definition = getProductShortcutDefinition(actionId);

  if (!definition || definition.locked) {
    return false;
  }

  if (RESERVED_BROWSER_KEYS.has(normalized)) {
    return false;
  }

  return true;
};

export type ResolveShortcutsInput = {
  tenantOverrides?: ShortcutOverrides;
  tenantLockedActions?: ShortcutActionId[];
  allowUserCustomize?: boolean;
  allowFnKeyBindings?: boolean;
  userOverrides?: ShortcutOverrides;
};

const isProductLocked = (actionId: ShortcutActionId): boolean =>
  PRODUCT_LOCKED_ACTIONS.includes(actionId);

const isTenantLockedForUser = (
  actionId: ShortcutActionId,
  tenantLockedActions: ShortcutActionId[]
): boolean => tenantLockedActions.includes(actionId);

const isActionLocked = (
  actionId: ShortcutActionId,
  tenantLockedActions: ShortcutActionId[]
): boolean =>
  isProductLocked(actionId) ||
  isTenantLockedForUser(actionId, tenantLockedActions);

const getOverrideRejectionReason = (
  actionId: ShortcutActionId,
  normalized: string,
  input: ResolveShortcutsInput,
  source: "tenant" | "user"
): string | null => {
  if (isProductLocked(actionId)) {
    return `${actionId} is locked by product defaults`;
  }

  if (
    source === "user" &&
    isTenantLockedForUser(actionId, input.tenantLockedActions ?? [])
  ) {
    return `${actionId} is locked by organization policy`;
  }

  const binding = createBindingFromNormalized(normalized);

  if (!binding) {
    return `Invalid shortcut binding for ${actionId}`;
  }

  if (!isAllowedProductOverride(actionId, binding.normalized)) {
    if (RESERVED_BROWSER_KEYS.has(binding.normalized)) {
      return "F5, F11, and F12 are reserved by the browser";
    }

    return `Shortcut binding is not allowed for ${actionId}`;
  }

  if (source === "user" && !input.allowUserCustomize) {
    return "User keyboard shortcut customization is disabled by policy";
  }

  if (
    isFnKeyBinding(binding.normalized) &&
    input.allowFnKeyBindings === false
  ) {
    return "Function key bindings are disabled by organization policy";
  }

  return null;
};

const canApplyOverride = (
  actionId: ShortcutActionId,
  normalized: string,
  input: ResolveShortcutsInput,
  source: "tenant" | "user"
): boolean =>
  getOverrideRejectionReason(actionId, normalized, input, source) === null;

const resolveBindingForAction = (
  actionId: ShortcutActionId,
  input: ResolveShortcutsInput
): { binding: ResolvedShortcut["binding"]; source: ShortcutSource } => {
  const definition = getProductShortcutDefinition(actionId);

  if (!definition) {
    throw new Error(`Unknown shortcut action: ${actionId}`);
  }

  const userOverride = input.userOverrides?.[actionId];
  if (userOverride && canApplyOverride(actionId, userOverride, input, "user")) {
    const binding = createBindingFromNormalized(userOverride);

    if (binding) {
      return { binding, source: "user" };
    }
  }

  const tenantOverride = input.tenantOverrides?.[actionId];
  if (
    tenantOverride &&
    canApplyOverride(actionId, tenantOverride, input, "tenant")
  ) {
    const binding = createBindingFromNormalized(tenantOverride);

    if (binding) {
      return { binding, source: "tenant" };
    }
  }

  return {
    binding: definition.defaultBinding,
    source: "product",
  };
};

export const resolveShortcuts = (
  input: ResolveShortcutsInput = {}
): WorkspaceShortcutsPayload => {
  const tenantLockedActions = input.tenantLockedActions ?? [];
  const bindings = {} as Record<ShortcutActionId, ResolvedShortcut>;
  const source = {} as Record<ShortcutActionId, ShortcutSource>;

  for (const definition of PRODUCT_SHORTCUT_DEFINITIONS) {
    const resolvedBinding = resolveBindingForAction(definition.actionId, input);

    bindings[definition.actionId] = {
      actionId: definition.actionId,
      binding: resolvedBinding.binding,
      secondaryBinding: definition.secondaryBinding,
      group: definition.group,
      scope: definition.scope,
      locked: isActionLocked(definition.actionId, tenantLockedActions),
      source: resolvedBinding.source,
      description: definition.description,
      reliability: definition.reliability,
      browserConflict: definition.browserConflict,
    };

    source[definition.actionId] = resolvedBinding.source;
  }

  const policy: ShortcutPolicy = {
    allowUserCustomize: input.allowUserCustomize ?? false,
    allowFnKeyBindings: input.allowFnKeyBindings ?? true,
    lockedActions: [
      ...PRODUCT_LOCKED_ACTIONS,
      ...tenantLockedActions.filter((actionId) => !isProductLocked(actionId)),
    ],
  };

  return {
    bindings,
    policy,
    source,
    layers: {
      tenant: input.tenantOverrides ?? {},
      user: input.userOverrides ?? {},
    },
  };
};

export const resolveProductDefaults = (): WorkspaceShortcutsPayload =>
  resolveShortcuts();

const findBindingCollision = (
  actionId: ShortcutActionId,
  normalized: string,
  preview: WorkspaceShortcutsPayload
): string | null => {
  for (const [otherActionId, shortcut] of Object.entries(preview.bindings)) {
    if (otherActionId === actionId) {
      continue;
    }

    if (
      bindingsMatch(normalized, shortcut.binding.normalized) ||
      (shortcut.secondaryBinding &&
        bindingsMatch(normalized, shortcut.secondaryBinding.normalized))
    ) {
      return `Binding conflicts with ${otherActionId} (${shortcut.binding.label})`;
    }
  }

  return null;
};

const validateOverrideEntries = (
  overrides: ShortcutOverrides,
  input: ResolveShortcutsInput,
  source: "tenant" | "user"
):
  | { ok: true; overrides: ShortcutOverrides }
  | { ok: false; error: string } => {
  const sanitized: ShortcutOverrides = {};
  const seenBindings = new Map<string, ShortcutActionId>();

  for (const [rawActionId, rawBinding] of Object.entries(overrides)) {
    const actionId = rawActionId as ShortcutActionId;
    const rejection = getOverrideRejectionReason(
      actionId,
      rawBinding,
      input,
      source
    );

    if (rejection) {
      return { ok: false, error: rejection };
    }

    const binding = createBindingFromNormalized(rawBinding);

    if (!binding) {
      return { ok: false, error: `Invalid shortcut binding for ${actionId}` };
    }

    const duplicateAction = seenBindings.get(binding.normalized);

    if (duplicateAction) {
      return {
        ok: false,
        error: `Duplicate binding ${binding.label} for ${actionId} and ${duplicateAction}`,
      };
    }

    seenBindings.set(binding.normalized, actionId);
    sanitized[actionId] = binding.normalized;
  }

  const previewInput: ResolveShortcutsInput =
    source === "tenant"
      ? {
          ...input,
          tenantOverrides: {
            ...input.tenantOverrides,
            ...sanitized,
          },
        }
      : {
          ...input,
          userOverrides: {
            ...input.userOverrides,
            ...sanitized,
          },
        };

  const preview = resolveShortcuts(previewInput);

  for (const [actionId, normalized] of Object.entries(sanitized)) {
    const collision = findBindingCollision(
      actionId as ShortcutActionId,
      normalized,
      preview
    );

    if (collision) {
      return { ok: false, error: `${actionId}: ${collision}` };
    }
  }

  return { ok: true, overrides: sanitized };
};

export const validateUserOverrides = (
  overrides: ShortcutOverrides,
  input: ResolveShortcutsInput
): { ok: true; overrides: ShortcutOverrides } | { ok: false; error: string } =>
  validateOverrideEntries(overrides, input, "user");

export const validateTenantOverrides = (
  overrides: ShortcutOverrides,
  input: ResolveShortcutsInput
): { ok: true; overrides: ShortcutOverrides } | { ok: false; error: string } =>
  validateOverrideEntries(overrides, input, "tenant");

export const validateTenantLockedActions = (
  lockedActions: ShortcutActionId[]
):
  | { ok: true; lockedActions: ShortcutActionId[] }
  | { ok: false; error: string } => {
  const unique = [...new Set(lockedActions)];

  for (const actionId of unique) {
    if (isProductLocked(actionId)) {
      return {
        ok: false,
        error: `${actionId} is already locked by product defaults`,
      };
    }
  }

  return { ok: true, lockedActions: unique };
};
