import { z } from "zod";

const boundedContextStringSchema = z.string().trim().min(1);
const boundedContextStringArraySchema = z
  .array(boundedContextStringSchema)
  .min(1);

export const offboardingIntegrationDependencySchema = z.object({
  feature: boundedContextStringSchema,
  relationship: boundedContextStringSchema,
  purpose: boundedContextStringSchema,
});

export const offboardingIntegrationDependenciesSchema = z
  .array(offboardingIntegrationDependencySchema)
  .min(1);

export const offboardingExitManagementBoundedContextSchema = z.object({
  ownedCapabilities: boundedContextStringArraySchema,
  ownedEntities: boundedContextStringArraySchema,
  inputs: boundedContextStringArraySchema,
  outputs: boundedContextStringArraySchema,
  exclusions: boundedContextStringArraySchema,
});

export type OffboardingIntegrationDependency = z.infer<
  typeof offboardingIntegrationDependencySchema
>;
export type OffboardingExitManagementBoundedContext = z.infer<
  typeof offboardingExitManagementBoundedContextSchema
>;
