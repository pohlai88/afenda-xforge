import { z } from "zod";

const metadataStringSchema = z.string().trim().min(1);
const metadataStringArraySchema = z.array(metadataStringSchema).min(1);

export const complianceRegulatoryTrackingMetadataSchema = z.object({
  id: metadataStringSchema,
  title: metadataStringSchema,
  description: metadataStringSchema,
  domain: metadataStringSchema,
  feature: metadataStringSchema,
  category: metadataStringSchema,
  tags: metadataStringArraySchema,
  keywords: metadataStringArraySchema,
  icon: metadataStringSchema,
  maturity: z.enum(["experimental", "managed", "enterprise"]),
  visibility: z.enum(["internal", "restricted", "public"]),
  version: z.literal(1),
});

export type ComplianceRegulatoryTrackingMetadata = z.infer<
  typeof complianceRegulatoryTrackingMetadataSchema
>;
