import { z } from "zod";
import { isShortcutActionId } from "./contract.ts";

export const shortcutOverridesSchema = z
  .record(z.string(), z.union([z.string().min(1), z.null()]))
  .superRefine((overrides, context) => {
    for (const actionId of Object.keys(overrides)) {
      if (!isShortcutActionId(actionId)) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Unknown shortcut action: ${actionId}`,
          path: [actionId],
        });
      }
    }
  });

export const shortcutOverridesPostSchema = z
  .object({
    overrides: shortcutOverridesSchema,
  })
  .strict();
