import { z } from "zod";
import type { SHORTCUT_ACTION_IDS } from "./contract.ts";
import { isShortcutActionId } from "./contract.ts";
import { shortcutOverridesSchema } from "./override-schema.ts";

const shortcutActionIdSchema = z
  .string()
  .refine(isShortcutActionId, "Unknown shortcut action id");

export const tenantKeyboardShortcutPolicyPostSchema = z
  .object({
    allowUserCustomize: z.boolean().optional(),
    allowFnKeyBindings: z.boolean().optional(),
    lockedActions: z.array(shortcutActionIdSchema).optional(),
    overrides: shortcutOverridesSchema.optional(),
  })
  .strict();

export type TenantKeyboardShortcutPolicyPost = z.infer<
  typeof tenantKeyboardShortcutPolicyPostSchema
>;

export const isKnownShortcutActionId = (
  actionId: string
): actionId is (typeof SHORTCUT_ACTION_IDS)[number] =>
  isShortcutActionId(actionId);
