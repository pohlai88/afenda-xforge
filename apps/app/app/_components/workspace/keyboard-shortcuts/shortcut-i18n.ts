import type { ShortcutActionId } from "../../../../lib/workspace-shortcuts/contract.ts";

export const shortcutActionMessageKey = (actionId: ShortcutActionId): string =>
  actionId.replaceAll(".", "_");
