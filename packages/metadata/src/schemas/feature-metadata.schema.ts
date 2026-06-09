import { z } from "zod";

import { metadataActionSchema } from "./action.schema.ts";
import { metadataFieldSchema } from "./field.schema.ts";
import { metadataFilterSchema } from "./filter.schema.ts";
import { metadataFormSchema } from "./form.schema.ts";
import { metadataPermissionHintSchema } from "./permission-hint.schema.ts";
import { metadataPresentationSchema } from "./presentation.schema.ts";
import { metadataSectionSchema } from "./section.schema.ts";
import { metadataStateSchema } from "./state.schema.ts";
import { metadataTableSchema } from "./table.schema.ts";

export { metadataPermissionHintSchema } from "./permission-hint.schema.ts";
export { metadataPresentationSchema } from "./presentation.schema.ts";

export const metadataIdSchema = z.string().trim().min(1);

export const metadataLabelsSchema = z
  .object({
    singular: z.string().trim().min(1),
    plural: z.string().trim().min(1),
  })
  .strict();

export const metadataFeatureSchema = z
  .object({
    actions: z.array(metadataActionSchema).readonly().optional(),
    description: z.string().trim().min(1).optional(),
    entity: z.string().trim().min(1),
    fields: z.array(metadataFieldSchema).readonly().optional(),
    filters: z.array(metadataFilterSchema).readonly().optional(),
    forms: z.array(metadataFormSchema).readonly().optional(),
    id: metadataIdSchema,
    labels: metadataLabelsSchema,
    permissionHint: metadataPermissionHintSchema.optional(),
    presentation: metadataPresentationSchema.optional(),
    sections: z.array(metadataSectionSchema).readonly().optional(),
    states: z.array(metadataStateSchema).readonly().optional(),
    tables: z.array(metadataTableSchema).readonly().optional(),
    title: z.string().trim().min(1).optional(),
  })
  .strict();
