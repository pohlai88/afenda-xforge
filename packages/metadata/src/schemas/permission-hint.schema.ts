import { z } from "zod";

export const metadataPermissionHintSchema = z
  .object({
    action: z.string().trim().min(1).optional(),
    claim: z.string().trim().min(1).optional(),
    reason: z.string().trim().min(1).optional(),
    scope: z.string().trim().min(1).optional(),
    subject: z.string().trim().min(1).optional(),
  })
  .strict();
