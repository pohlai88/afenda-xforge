import { z } from "zod";
import { metadataFilterCustomizationSchema } from "./customization-policy.schema.ts";

export const metadataFilterOptionSchema = z
  .object({
    label: z.string().trim().min(1),
    value: z.union([z.boolean(), z.number(), z.string()]),
    disabled: z.boolean().optional(),
  })
  .strict();

export const metadataFilterSchema = z
  .object({
    customization: metadataFilterCustomizationSchema.optional(),
    key: z.string().trim().min(1),
    label: z.string().trim().min(1),
    field: z.string().trim().min(1),
    kind: z.enum([
      "boolean",
      "date",
      "datetime",
      "money",
      "multiselect",
      "number",
      "select",
      "status",
      "text",
    ]),
    description: z.string().trim().min(1).optional(),
    operator: z
      .enum([
        "between",
        "contains",
        "endsWith",
        "equals",
        "greaterThan",
        "greaterThanOrEqual",
        "in",
        "lessThan",
        "lessThanOrEqual",
        "startsWith",
      ])
      .optional(),
    options: z.array(metadataFilterOptionSchema).readonly().optional(),
    permissionHint: z.string().trim().min(1).optional(),
    placeholder: z.string().trim().min(1).optional(),
  })
  .strict();
