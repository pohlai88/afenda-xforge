import { z } from "zod";

const manifestStringSchema = z.string().trim().min(1);
const manifestStringArraySchema = z.array(manifestStringSchema);

export const organizationalChartHierarchyManifestSchema = z.object({
  id: manifestStringSchema,
  title: manifestStringSchema,
  description: manifestStringSchema,
  domain: manifestStringSchema,
  version: z.literal(1),
  schemaVersion: z.literal(1),
  lifecycle: z.enum(["active", "deprecated", "retired"]),
  stability: z.enum(["alpha", "beta", "stable"]),
  packageName: manifestStringSchema,
  source: z.literal("hr-suite"),
  suite: z.literal("hr-suite"),
  ownedEntities: manifestStringArraySchema.min(1),
  capabilities: manifestStringArraySchema.min(1),
  auditEvents: manifestStringArraySchema.min(1),
  routeContracts: z.record(
    manifestStringSchema,
    z.object({
      method: manifestStringSchema,
      path: manifestStringSchema,
      version: manifestStringSchema,
    })
  ),
});

export type OrganizationalChartHierarchyManifest = z.infer<
  typeof organizationalChartHierarchyManifestSchema
>;
