import { z } from "zod";

const boundedContextStringSchema = z.string().trim().min(1);
const boundedContextStringArraySchema = z
  .array(boundedContextStringSchema)
  .min(1);

export const complianceRegulatoryTrackingIntegrationSchema = z.object({
  feature: boundedContextStringSchema,
  relationship: boundedContextStringSchema,
  purpose: boundedContextStringSchema,
});

export const complianceRegulatoryTrackingIntegrationsSchema = z
  .array(complianceRegulatoryTrackingIntegrationSchema)
  .min(1);

export const complianceRegulatoryTrackingBoundedContextSchema = z.object({
  ownedCapabilities: boundedContextStringArraySchema,
  ownedEntities: boundedContextStringArraySchema,
  inputs: boundedContextStringArraySchema,
  outputs: boundedContextStringArraySchema,
  exclusions: boundedContextStringArraySchema,
});

export type ComplianceRegulatoryTrackingIntegration = z.infer<
  typeof complianceRegulatoryTrackingIntegrationSchema
>;
export type ComplianceRegulatoryTrackingBoundedContext = z.infer<
  typeof complianceRegulatoryTrackingBoundedContextSchema
>;
