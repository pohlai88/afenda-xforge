import { z } from "zod";

export const metadataCustomizationScopeSchema = z.enum(["company", "tenant"]);

export const metadataFieldCustomizationSchema = z
  .object({
    description: z.boolean().optional(),
    hidden: z.enum(["allow", "allow-required"]).optional(),
    label: z.boolean().optional(),
    order: z.boolean().optional(),
    placeholder: z.boolean().optional(),
    systemOwned: z.boolean().optional(),
  })
  .strict();

export const metadataSectionCustomizationSchema = z
  .object({
    columns: z.boolean().optional(),
    description: z.boolean().optional(),
    fieldKeys: z.boolean().optional(),
    hidden: z.boolean().optional(),
    label: z.boolean().optional(),
  })
  .strict();

export const metadataFormCustomizationSchema = z
  .object({
    hidden: z.boolean().optional(),
    label: z.boolean().optional(),
    layout: z.boolean().optional(),
    sectionKeys: z.boolean().optional(),
  })
  .strict();

export const metadataTableColumnCustomizationSchema = z
  .object({
    align: z.boolean().optional(),
    field: z.boolean().optional(),
    hidden: z.boolean().optional(),
    label: z.boolean().optional(),
    order: z.boolean().optional(),
    width: z.boolean().optional(),
  })
  .strict();

export const metadataTableCustomizationSchema = z
  .object({
    columns: z.boolean().optional(),
    hidden: z.boolean().optional(),
    title: z.boolean().optional(),
  })
  .strict();

export const metadataEntityTableCustomizationSchema = z
  .object({
    columns: z.boolean().optional(),
    defaultSort: z.boolean().optional(),
    title: z.boolean().optional(),
  })
  .strict();

export const metadataFilterCustomizationSchema = z
  .object({
    hidden: z.boolean().optional(),
    label: z.boolean().optional(),
  })
  .strict();

export const metadataActionCustomizationSchema = z
  .object({
    hidden: z.boolean().optional(),
    label: z.boolean().optional(),
    placement: z.boolean().optional(),
    safe: z.boolean().optional(),
  })
  .strict();

export const metadataPresentationCustomizationSchema = z
  .object({
    density: z.boolean().optional(),
    icon: z.boolean().optional(),
    size: z.boolean().optional(),
    tone: z.boolean().optional(),
    variant: z.boolean().optional(),
  })
  .strict();

export const metadataFeatureCustomizationSchema = z
  .object({
    presentation: metadataPresentationCustomizationSchema.optional(),
    scopes: z.array(metadataCustomizationScopeSchema).readonly().optional(),
  })
  .strict();
