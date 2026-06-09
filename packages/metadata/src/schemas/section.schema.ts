import { z } from "zod";
import { metadataSectionCustomizationSchema } from "./customization-policy.schema.ts";

export const metadataSectionSchema = z
  .object({
    key: z.string().trim().min(1),
    label: z.string().trim().min(1),
    customization: metadataSectionCustomizationSchema.optional(),
    description: z.string().trim().min(1).optional(),
    fieldKeys: z.array(z.string().trim().min(1)).readonly(),
    columns: z
      .union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)])
      .optional(),
    collapsible: z.boolean().optional(),
    permissionHint: z.string().trim().min(1).optional(),
  })
  .strict();
