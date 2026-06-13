import { z } from "zod";
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
