import { z } from "zod";

export const hrRecordsFeatureManifestSchema = z.object({
  id: z.string().trim().min(1),
  title: z.string().trim().min(1),
  description: z.string().trim().min(1),
  domain: z.string().trim().min(1),
  packageName: z.string().trim().min(1),
  suite: z.literal("hr-suite"),
});

export type HrRecordsFeatureManifest = z.infer<
  typeof hrRecordsFeatureManifestSchema
>;
