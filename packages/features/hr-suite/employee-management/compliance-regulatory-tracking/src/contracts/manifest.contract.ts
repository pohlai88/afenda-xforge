import { z } from "zod";

const manifestStringSchema = z.string().trim().min(1);
const manifestStringArraySchema = z.array(manifestStringSchema);

const manifestCapabilityGroupSchema = z.object({
  id: manifestStringSchema,
  label: manifestStringSchema,
  capabilities: manifestStringArraySchema.min(1),
});

const manifestIntegrationSchema = z.object({
  feature: manifestStringSchema,
  relationship: manifestStringSchema,
  purpose: manifestStringSchema,
});

const manifestAuditEventGroupSchema = z.object({
  id: manifestStringSchema,
  label: manifestStringSchema,
  events: manifestStringArraySchema.min(1),
});
const manifestActionSchema = z.object({
  id: manifestStringSchema,
  label: manifestStringSchema,
  description: manifestStringSchema,
  capability: manifestStringSchema,
  risk: z.enum(["low", "medium", "high", "critical"]),
  approvalRequired: z.boolean().optional(),
  auditEvent: manifestStringSchema,
});

const manifestDashboardSchema = z.object({
  id: manifestStringSchema,
  label: manifestStringSchema,
  description: manifestStringSchema,
  metrics: manifestStringArraySchema.min(1),
});

const manifestNavigationGroupSchema = z.object({
  id: manifestStringSchema,
  label: manifestStringSchema,
  pages: manifestStringArraySchema.min(1),
});

const manifestNavigationPageSchema = z.object({
  id: manifestStringSchema,
  path: manifestStringSchema,
  title: manifestStringSchema,
  navigationLabel: manifestStringSchema,
  capability: manifestStringSchema,
  showInNavigation: z.boolean(),
  showInSearch: z.boolean(),
});

const manifestNavigationSchema = z.object({
  defaultPage: manifestStringSchema,
  basePath: manifestStringSchema,
  featureId: manifestStringSchema,
  navigationGroups: z.array(manifestNavigationGroupSchema).min(1),
  pages: z.array(manifestNavigationPageSchema).min(1),
});

const manifestBoundedContextSchema = z.object({
  ownedCapabilities: manifestStringArraySchema.min(1),
  ownedEntities: manifestStringArraySchema.min(1),
  inputs: manifestStringArraySchema.min(1),
  outputs: manifestStringArraySchema.min(1),
  exclusions: manifestStringArraySchema.min(1),
});

const manifestGovernanceSchema = z.object({
  auditTrail: z.boolean(),
  deterministicProjections: z.boolean(),
  effectiveDating: z.boolean(),
  exceptionManagement: z.boolean(),
  jurisdictionalApplicability: z.boolean(),
  sensitiveAccessControl: z.boolean(),
});

const manifestOwnershipSchema = z.object({
  businessOwner: manifestStringSchema,
  technicalOwner: manifestStringSchema,
  dataSteward: manifestStringSchema,
});

const manifestDataClassificationSchema = z.object({
  confidentiality: z.enum(["internal", "confidential", "restricted"]),
  containsPii: z.boolean(),
  retentionRequired: z.boolean(),
});

const manifestRiskClassificationSchema = z.object({
  dataSensitivity: z.enum(["low", "medium", "high", "critical"]),
  auditRequired: z.boolean(),
  approvalRequiredFor: manifestStringArraySchema.min(1),
});

const manifestRouteContractSchema = z.object({
  method: manifestStringSchema,
  path: manifestStringSchema,
  version: manifestStringSchema,
});

export const complianceRegulatoryTrackingManifestSchema = z.object({
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
  capabilities: manifestStringArraySchema.min(1),
  capabilityGroups: z.array(manifestCapabilityGroupSchema).min(1),
  dashboardMetrics: z.record(manifestStringSchema, manifestStringSchema),
  ownership: manifestOwnershipSchema,
  navigation: manifestNavigationSchema,
  dashboards: z.array(manifestDashboardSchema).min(1),
  governance: manifestGovernanceSchema,
  actions: z.array(manifestActionSchema).min(1),
  highRiskActions: z.array(manifestActionSchema).min(1),
  approvalActions: z.array(manifestActionSchema).min(1),
  audit: z.object({
    events: manifestStringArraySchema.min(1),
    eventGroups: z.array(manifestAuditEventGroupSchema).min(1),
    highRiskEvents: manifestStringArraySchema.min(1),
  }),
  dataClassification: manifestDataClassificationSchema,
  riskClassification: manifestRiskClassificationSchema,
  integrations: z.array(manifestIntegrationSchema).min(1),
  requirementCoverage: manifestStringArraySchema.min(1),
  acceptanceCriteria: manifestStringArraySchema.min(1),
  sensitiveCapabilities: manifestStringArraySchema.min(1),
  statuses: manifestStringArraySchema.min(1),
  writeCapabilities: manifestStringArraySchema.min(1),
  routeContracts: z.record(manifestStringSchema, manifestRouteContractSchema),
});

export type ComplianceRegulatoryTrackingManifest = z.infer<
  typeof complianceRegulatoryTrackingManifestSchema
>;
