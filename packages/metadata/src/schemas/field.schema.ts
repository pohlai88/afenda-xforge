import { z } from "zod";

import { metadataFieldKinds } from "../constants/field-kinds.ts";
import { metadataFieldCustomizationSchema } from "./customization-policy.schema.ts";

export const metadataFieldSchema = z
  .object({
    customization: metadataFieldCustomizationSchema.optional(),
    id: z.string().trim().min(1).optional(),
    key: z.string().trim().min(1),
    label: z.string().trim().min(1),
    kind: z.enum(metadataFieldKinds),
    required: z.boolean().optional(),
    description: z.string().trim().min(1).optional(),
    placeholder: z.string().trim().min(1).optional(),
    permissionHint: z.string().trim().min(1).optional(),
    validationHint: z.string().trim().min(1).optional(),
  })
  .strict();
