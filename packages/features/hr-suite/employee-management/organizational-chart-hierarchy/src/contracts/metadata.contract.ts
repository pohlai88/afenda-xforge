import { z } from "zod";

const metadataStringSchema = z.string().trim().min(1);

export const organizationalChartHierarchyMetadataSchema = z.object({
  id: metadataStringSchema,
  title: metadataStringSchema,
  description: metadataStringSchema,
  domain: metadataStringSchema,
  feature: metadataStringSchema,
  category: metadataStringSchema,
  tags: z.array(metadataStringSchema).min(1),
  keywords: z.array(metadataStringSchema).min(1),
  icon: metadataStringSchema,
  maturity: z.enum(["experimental", "managed", "enterprise"]),
  visibility: z.enum(["internal", "restricted", "public"]),
  version: z.literal(1),
});

export type OrganizationalChartHierarchyMetadata = z.infer<
  typeof organizationalChartHierarchyMetadataSchema
>;
