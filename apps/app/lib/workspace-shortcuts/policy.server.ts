import "server-only";

import type { ShortcutActionId } from "./contract.ts";

export const DEFAULT_TENANT_SHORTCUT_POLICY = {
  allowUserCustomize: false,
  allowFnKeyBindings: true,
  lockedActions: [] as ShortcutActionId[],
  overrides: {} as Partial<Record<ShortcutActionId, string>>,
};
