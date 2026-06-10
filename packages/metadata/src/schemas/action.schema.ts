import { z } from "zod";

import { metadataActionKinds } from "../constants/action-kinds.ts";
import { metadataActionCustomizationSchema } from "./customization-policy.schema.ts";

export const metadataActionSchema = z
  .object({
    customization: metadataActionCustomizationSchema.optional(),
    id: z.string().trim().min(1).optional(),
    key: z.string().trim().min(1),
    label: z.string().trim().min(1),
    kind: z.enum(metadataActionKinds),
    description: z.string().trim().min(1).optional(),
    confirmMessage: z.string().trim().min(1).optional(),
    dangerous: z.boolean().optional(),
    permissionHint: z.string().trim().min(1).optional(),
    placement: z.enum(["overflow", "primary", "row", "secondary"]).optional(),
    requiresSelection: z.boolean().optional(),
    stateTransition: z
      .object({
        from: z.array(z.string().trim().min(1)).readonly().optional(),
        to: z.string().trim().min(1).optional(),
      })
      .strict()
      .optional(),
  })
  .strict();
