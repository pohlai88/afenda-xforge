import { z } from "zod";
import { complianceRegulatoryTrackingCapabilitySchema } from "./capability.contract.ts";

const navigationStringSchema = z.string().trim().min(1);
export const complianceRegulatoryTrackingNavigationCapabilitySchema: typeof complianceRegulatoryTrackingCapabilitySchema =
  complianceRegulatoryTrackingCapabilitySchema;

export const complianceRegulatoryTrackingNavigationPageSchema = z.object({
  id: navigationStringSchema,
  path: navigationStringSchema,
  title: navigationStringSchema,
  navigationLabel: navigationStringSchema,
  capability: complianceRegulatoryTrackingNavigationCapabilitySchema,
  showInNavigation: z.boolean(),
  showInSearch: z.boolean(),
});

export const complianceRegulatoryTrackingNavigationGroupSchema = z.object({
  id: navigationStringSchema,
  label: navigationStringSchema,
  pages: z.array(navigationStringSchema).min(1),
});

export const complianceRegulatoryTrackingNavigationSchema = z.object({
  defaultPage: navigationStringSchema,
  basePath: navigationStringSchema,
  featureId: navigationStringSchema,
  navigationGroups: z
    .array(complianceRegulatoryTrackingNavigationGroupSchema)
    .min(1),
  pages: z.array(complianceRegulatoryTrackingNavigationPageSchema).min(1),
});

export type ComplianceRegulatoryTrackingNavigationPage = z.infer<
  typeof complianceRegulatoryTrackingNavigationPageSchema
>;
export type ComplianceRegulatoryTrackingNavigationGroup = z.infer<
  typeof complianceRegulatoryTrackingNavigationGroupSchema
>;
export type ComplianceRegulatoryTrackingNavigation = z.infer<
  typeof complianceRegulatoryTrackingNavigationSchema
>;
