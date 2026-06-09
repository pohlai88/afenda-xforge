import { z } from "zod";

export const metadataTableColumnSchema = z
  .object({
    key: z.string().trim().min(1),
    label: z.string().trim().min(1),
    field: z.string().trim().min(1),
    sortable: z.boolean().optional(),
    filterable: z.boolean().optional(),
    align: z.enum(["start", "center", "end"]).optional(),
    width: z.enum(["sm", "md", "lg", "auto"]).optional(),
  })
  .strict();

export const metadataTableSchema = z
  .object({
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
