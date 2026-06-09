import { z } from "zod";

export const metadataFormSchema = z
  .object({
    key: z.string().trim().min(1),
    label: z.string().trim().min(1),
    description: z.string().trim().min(1).optional(),
    fieldKeys: z.array(z.string().trim().min(1)).readonly(),
    sectionKeys: z.array(z.string().trim().min(1)).readonly().optional(),
    submitActionKey: z.string().trim().min(1).optional(),
    cancelActionKey: z.string().trim().min(1).optional(),
    layout: z.enum(["grid", "inline", "stack"]).optional(),
    permissionHint: z.string().trim().min(1).optional(),
  })
  .strict();
