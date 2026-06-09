import { z } from "zod";

export const hrRecordsFeatureLabelsSchema = z.object({
  singular: z.string().trim().min(1),
  plural: z.string().trim().min(1),
});

export const hrRecordsFeatureMetadataSchema = z.object({
  id: z.string().trim().min(1),
  title: z.string().trim().min(1),
  description: z.string().trim().min(1),
  domain: z.string().trim().min(1),
  labels: hrRecordsFeatureLabelsSchema,
  source: z.literal("legacy-hr-suite"),
  suite: z.literal("hr-suite"),
});

export type HrRecordsFeatureMetadata = z.infer<
  typeof hrRecordsFeatureMetadataSchema
>;
