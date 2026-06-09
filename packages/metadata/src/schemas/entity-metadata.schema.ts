import { z } from "zod";

import { metadataActionSchema } from "./action.schema.ts";
import { metadataFeatureCustomizationSchema } from "./customization-policy.schema.ts";
import { metadataFieldSchema } from "./field.schema.ts";
import { metadataFilterSchema } from "./filter.schema.ts";
import { metadataFormSchema } from "./form.schema.ts";
import { metadataPermissionHintSchema } from "./permission-hint.schema.ts";
import { metadataPresentationSchema } from "./presentation.schema.ts";
import { metadataSectionSchema } from "./section.schema.ts";
import { metadataStateSchema } from "./state.schema.ts";
import {
  metadataEntityTableColumnSchema,
  metadataEntityTableSchema,
  metadataTableSchema,
} from "./table.schema.ts";

export const entityMetadataColumnSchema = metadataEntityTableColumnSchema;

export const entityMetadataSchema = z
  .object({
    actions: z.array(metadataActionSchema).readonly().optional(),
    customization: metadataFeatureCustomizationSchema.optional(),
    description: z.string().trim().min(1).optional(),
    entity: z.string().trim().min(1),
    fields: z.array(metadataFieldSchema).readonly().optional(),
    filters: z.array(metadataFilterSchema).readonly().optional(),
    forms: z.array(metadataFormSchema).readonly().optional(),
    id: z.string().trim().min(1).optional(),
    labels: z
      .object({
        singular: z.string().trim().min(1),
        plural: z.string().trim().min(1),
      })
      .strict(),
    permissionHint: metadataPermissionHintSchema.optional(),
    presentation: metadataPresentationSchema.optional(),
    sections: z.array(metadataSectionSchema).readonly().optional(),
    states: z.array(metadataStateSchema).readonly().optional(),
    table: metadataEntityTableSchema.optional(),
    tables: z.array(metadataTableSchema).readonly().optional(),
    title: z.string().trim().min(1).optional(),
  })
  .strict();
