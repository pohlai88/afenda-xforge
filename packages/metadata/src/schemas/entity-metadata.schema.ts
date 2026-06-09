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

export const entityMetadataColumnSchema = z
  .object({
    key: z.string().trim().min(1),
    label: z.string().trim().min(1),
    field: z.string().trim().min(1).optional(),
    kind: z.enum(["date", "email", "money", "status", "text"]).optional(),
    align: z.enum(["start", "center", "end"]).optional(),
    filterable: z.boolean().optional(),
    sortable: z.boolean().optional(),
    width: z.enum(["sm", "md", "lg", "auto"]).optional(),
    description: z.string().trim().min(1).optional(),
  })
  .strict();

export const entityMetadataTableSchema = z
  .object({
    defaultSort: z.string().trim().min(1),
    columns: z.array(entityMetadataColumnSchema).readonly(),
    title: z.string().trim().min(1).optional(),
  })
  .strict();

export const entityMetadataSchema = z
  .object({
    actions: z.array(metadataActionSchema).readonly().optional(),
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
    table: entityMetadataTableSchema.optional(),
    tables: z.array(metadataTableSchema).readonly().optional(),
    title: z.string().trim().min(1).optional(),
  })
  .strict();
