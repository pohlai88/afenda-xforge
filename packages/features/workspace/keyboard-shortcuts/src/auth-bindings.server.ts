import "server-only";

import { ConfigurationError } from "@repo/errors";

export type KeyboardShortcutsTenantMembership = {
  role: string;
  tenantId: string;
  userId: string;
};

export type KeyboardShortcutsTenantAccess = {
  membership: KeyboardShortcutsTenantMembership;
  user: {
    id: string;
  };
};

export type KeyboardShortcutsAuthBindings = {
  requireActiveTenantAccess: () => Promise<KeyboardShortcutsTenantAccess>;
  requireActiveTenantMembership: () => Promise<KeyboardShortcutsTenantMembership>;
};

let authBindings: KeyboardShortcutsAuthBindings | null = null;

export const bindKeyboardShortcutsAuth = (
  bindings: KeyboardShortcutsAuthBindings
): void => {
  authBindings = bindings;
};

export const getKeyboardShortcutsAuthBindings =
  (): KeyboardShortcutsAuthBindings => {
    if (!authBindings) {
      throw new ConfigurationError(
        "Keyboard shortcuts auth bindings are not configured. Import app workspace-shortcuts server bindings before calling queries or execution."
      );
    }

    return authBindings;
  };
