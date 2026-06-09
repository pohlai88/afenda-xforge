import { z } from "zod";
import {
  metadataEntityTableCustomizationSchema,
  metadataTableColumnCustomizationSchema,
  metadataTableCustomizationSchema,
} from "./customization-policy.schema.ts";

export const metadataTableColumnSchema = z
  .object({
    customization: metadataTableColumnCustomizationSchema.optional(),
    key: z.string().trim().min(1),
    label: z.string().trim().min(1),
    field: z.string().trim().min(1),
    sortable: z.boolean().optional(),
    filterable: z.boolean().optional(),
    align: z.enum(["start", "center", "end"]).optional(),
    width: z.enum(["sm", "md", "lg", "auto"]).optional(),
  })
  .strict();

export const metadataEntityTableColumnSchema = z
  .object({
    customization: metadataTableColumnCustomizationSchema.optional(),
    key: z.string().trim().min(1),
    label: z.string().trim().min(1),
    field: z.string().trim().min(1).optional(),
    sortable: z.boolean().optional(),
    filterable: z.boolean().optional(),
    kind: z.enum(["date", "email", "money", "status", "text"]).optional(),
    align: z.enum(["start", "center", "end"]).optional(),
    width: z.enum(["sm", "md", "lg", "auto"]).optional(),
    description: z.string().trim().min(1).optional(),
  })
  .strict();

export const metadataTableSchema = z
  .object({
    customization: metadataTableCustomizationSchema.optional(),
    key: z.string().trim().min(1),
    title: z.string().trim().min(1),
    columns: z.array(metadataTableColumnSchema).readonly(),
    supports: z
      .object({
        pagination: z.literal(true),
        sorting: z.literal(true),
        filtering: z.literal(true),
        rowActions: z.literal(true),
        emptyState: z.literal(true),
        permissionAwareActions: z.literal(true),
      })
      .strict(),
  })
  .strict();

export const metadataEntityTableSchema = z
  .object({
    customization: metadataEntityTableCustomizationSchema.optional(),
    defaultSort: z.string().trim().min(1),
    columns: z.array(metadataEntityTableColumnSchema).readonly(),
    title: z.string().trim().min(1).optional(),
  })
  .strict();
