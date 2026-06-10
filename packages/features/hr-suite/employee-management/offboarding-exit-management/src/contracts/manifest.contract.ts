import { z } from "zod";

const manifestStringSchema = z.string().trim().min(1);
const manifestStringArraySchema = z.array(manifestStringSchema);

const manifestRouteContractSchema = z.object({
  method: manifestStringSchema,
  path: manifestStringSchema,
  version: manifestStringSchema,
});

const manifestBoundedContextSchema = z.object({
  ownedCapabilities: manifestStringArraySchema.min(1),
  ownedEntities: manifestStringArraySchema.min(1),
  inputs: manifestStringArraySchema.min(1),
  outputs: manifestStringArraySchema.min(1),
  exclusions: manifestStringArraySchema.min(1),
});

const manifestOwnershipSchema = z.object({
  businessOwner: manifestStringSchema,
  technicalOwner: manifestStringSchema,
  dataSteward: manifestStringSchema,
});

const manifestIntegrationSchema = z.object({
  feature: manifestStringSchema,
  relationship: manifestStringSchema,
  purpose: manifestStringSchema,
});

export const offboardingExitManagementManifestSchema = z.object({
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
  boundedContext: manifestBoundedContextSchema,
  ownership: manifestOwnershipSchema,
  integrations: z.array(manifestIntegrationSchema).min(1),
  routeContracts: z.record(manifestStringSchema, manifestRouteContractSchema),
});

export type OffboardingExitManagementManifest = z.infer<
  typeof offboardingExitManagementManifestSchema
>;
