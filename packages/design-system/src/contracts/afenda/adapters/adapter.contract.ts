import { z } from "zod";

export const AFENDA_ADAPTER_CONTRACT_ID =
  "afenda.adapter-contract" as const;
export const AFENDA_ADAPTER_CONTRACT_VERSION = "0.1.0" as const;

export const AFENDA_ADAPTER_STATUSES = [
  "mapped",
  "partial",
  "unsupported",
  "manual-review",
  "rejected",
] as const;

export const AFENDA_ADAPTER_DIAGNOSTIC_SEVERITIES = [
  "info",
  "warning",
  "error",
] as const;

export const AFENDA_ADAPTER_SOURCE_TYPES = [
  "legacy-afenda",
  "legacy-token",
  "legacy-theme-preset",
  "legacy-component-variant",
  "legacy-css-variable",
  "legacy-tailwind-config",
  "legacy-json-theme",
  "legacy-storybook-token",
  "external-design-token",
  "external-figma-token",
  "manual-import",
] as const;

export const AFENDA_ADAPTER_TARGET_CONTRACT_IDS = [
  "afenda.adapter-contract",
  "afenda.design-system",
  "afenda.runtime-reference",
  "afenda.theme-token-contract",
  "afenda.typography-contract",
  "afenda.component-variant-contract",
  "afenda.rule-evaluation-contract",
  "afenda.violation-contract",
  "afenda.remediation-contract",
  "afenda.agent-governance-contract",
  "afenda.form-framework-contract",
  "afenda.form-field-contract",
  "afenda.form-state-contract",
  "afenda.form-validation-contract",
] as const;

export const AFENDA_ADAPTER_GOVERNANCE_REFERENCES = [
  "AFENDA:adapter-contract",
  "AFENDA:design-system-contract",
  "AFENDA:runtime-reference-contract",
  "AFENDA:theme-token-contract",
  "AFENDA:component-variant-contract",
  "AFENDA:rule-evaluation-contract",
  "AFENDA:violation-contract",
  "AFENDA:remediation-contract",
  "AFENDA:agent-governance-contract",
  "AFENDA:audit-contract",
  "AFENDA:observability-contract",
  "AFENDA:approval-policy-contract",
  "AFENDA:migration-boundary",
  "AFENDA:risk-policy-contract",
  "XFORGE:permission-pipeline",
] as const;

export const AFENDA_ADAPTER_MAPPING_TRANSFORMS = [
  "copy",
  "rename",
  "normalize",
  "split",
  "merge",
  "derive",
  "drop",
] as const;

export const AFENDA_ADAPTER_MAPPING_LOSSINESS = [
  "none",
  "low",
  "medium",
  "high",
] as const;

export type AfendaAdapterStatus = (typeof AFENDA_ADAPTER_STATUSES)[number];
export type AfendaAdapterDiagnosticSeverity =
  (typeof AFENDA_ADAPTER_DIAGNOSTIC_SEVERITIES)[number];
export type AfendaAdapterSourceType =
  (typeof AFENDA_ADAPTER_SOURCE_TYPES)[number];
export type AfendaAdapterTargetContractId =
  (typeof AFENDA_ADAPTER_TARGET_CONTRACT_IDS)[number];
export type AfendaAdapterMappingTransform =
  (typeof AFENDA_ADAPTER_MAPPING_TRANSFORMS)[number];
export type AfendaAdapterMappingLossiness =
  (typeof AFENDA_ADAPTER_MAPPING_LOSSINESS)[number];

export type AfendaAdapterSource = {
  sourceId: string;
  type: AfendaAdapterSourceType;
  contractId?: string;
  version?: string;
  checksum?: string;
  capturedAt?: string;
  description?: string;
};

export type AfendaAdapterTarget = {
  contractId: AfendaAdapterTargetContractId;
  version: string;
  exportSubpath?: string;
};

export type AfendaAdapterDiagnostic = {
  diagnosticId: string;
  severity: AfendaAdapterDiagnosticSeverity;
  code: string;
  message: string;
  sourcePath?: string;
  targetPath?: string;
  remediation?: string;
  blocking?: boolean;
  ruleId?: string;
  reference?: string;
  metadata?: Record<string, unknown>;
};

export type AfendaAdapterFieldMapping = {
  sourcePath: string;
  targetPath: string;
  status: AfendaAdapterStatus;
  transform?: AfendaAdapterMappingTransform;
  lossiness?: AfendaAdapterMappingLossiness;
  reason?: string;
};

export type AfendaAdapterResult = {
  adapterId: string;
  source: AfendaAdapterSource;
  target: AfendaAdapterTarget;
  status: AfendaAdapterStatus;
  blocking: boolean;
  approvalRequired: boolean;
  approvedBy?: string;
  approvedAt?: string;
  approvalReason?: string;
  confidence: number;
  fieldMappings: readonly AfendaAdapterFieldMapping[];
  diagnostics: readonly AfendaAdapterDiagnostic[];
  migratedAt: string;
  migratedBy: string;
  auditEventId?: string;
  correlationId?: string;
  metadata?: Record<string, unknown>;
};

export const afendaAdapterStatusSchema = z.enum(AFENDA_ADAPTER_STATUSES);
export const afendaAdapterDiagnosticSeveritySchema = z.enum(
  AFENDA_ADAPTER_DIAGNOSTIC_SEVERITIES
);
export const afendaAdapterSourceTypeSchema = z.enum(
  AFENDA_ADAPTER_SOURCE_TYPES
);
export const afendaAdapterTargetContractIdSchema = z.enum(
  AFENDA_ADAPTER_TARGET_CONTRACT_IDS
);
export const afendaAdapterMappingTransformSchema = z.enum(
  AFENDA_ADAPTER_MAPPING_TRANSFORMS
);
export const afendaAdapterMappingLossinessSchema = z.enum(
  AFENDA_ADAPTER_MAPPING_LOSSINESS
);

export const afendaAdapterSourceSchema = z
  .object({
    sourceId: z.string().trim().min(1),
    type: afendaAdapterSourceTypeSchema,
    contractId: z.string().trim().min(1).optional(),
    version: z.string().trim().min(1).optional(),
    checksum: z.string().trim().min(1).optional(),
    capturedAt: z.string().datetime({ offset: true }).optional(),
    description: z.string().trim().min(1).optional(),
  })
  .strict();

export const afendaAdapterTargetSchema = z
  .object({
    contractId: afendaAdapterTargetContractIdSchema,
    version: z.string().trim().min(1),
    exportSubpath: z.string().trim().min(1).optional(),
  })
  .strict();

export const afendaAdapterDiagnosticSchema = z
  .object({
    diagnosticId: z.string().trim().min(1),
    severity: afendaAdapterDiagnosticSeveritySchema,
    code: z.string().trim().min(1),
    message: z.string().trim().min(1),
    sourcePath: z.string().trim().min(1).optional(),
    targetPath: z.string().trim().min(1).optional(),
    remediation: z.string().trim().min(1).optional(),
    blocking: z.boolean().optional(),
    ruleId: z.string().trim().min(1).optional(),
    reference: z.string().trim().min(1).optional(),
    metadata: z.record(z.string(), z.unknown()).optional(),
  })
  .strict();

export const afendaAdapterFieldMappingSchema = z
  .object({
    sourcePath: z.string().trim().min(1),
    targetPath: z.string().trim().min(1),
    status: afendaAdapterStatusSchema,
    transform: afendaAdapterMappingTransformSchema.optional(),
    lossiness: afendaAdapterMappingLossinessSchema.optional(),
    reason: z.string().trim().min(1).optional(),
  })
  .strict()
  .refine(
    (mapping) =>
      mapping.status === "mapped" ||
      mapping.status === "partial" ||
      Boolean(mapping.reason),
    "Unsupported, manual-review, and rejected field mappings require a reason"
  );

export const afendaAdapterResultSchema = z
  .object({
    adapterId: z.string().trim().min(1),
    source: afendaAdapterSourceSchema,
    target: afendaAdapterTargetSchema,
    status: afendaAdapterStatusSchema,
    blocking: z.boolean(),
    approvalRequired: z.boolean(),
    approvedBy: z.string().trim().min(1).optional(),
    approvedAt: z.string().datetime({ offset: true }).optional(),
    approvalReason: z.string().trim().min(1).optional(),
    confidence: z.number().min(0).max(1),
    fieldMappings: z.array(afendaAdapterFieldMappingSchema).readonly(),
    diagnostics: z.array(afendaAdapterDiagnosticSchema).readonly(),
    migratedAt: z.string().datetime({ offset: true }),
    migratedBy: z.string().trim().min(1),
    auditEventId: z.string().trim().min(1).optional(),
    correlationId: z.string().trim().min(1).optional(),
    metadata: z.record(z.string(), z.unknown()).optional(),
  })
  .strict()
  .refine(
    (result) => result.status === "mapped" || result.diagnostics.length > 0,
    "Partial, unsupported, manual-review, and rejected adapter results require diagnostics"
  )
  .refine(
    (result) =>
      result.status !== "mapped" ||
      result.fieldMappings.every((mapping) => mapping.status === "mapped"),
    "Mapped adapter results cannot contain non-mapped field mappings"
  )
  .refine(
    (result) =>
      !["unsupported", "manual-review", "rejected"].includes(result.status) ||
      result.confidence < 1,
    "Unsupported, manual-review, and rejected adapter results cannot use full confidence"
  )
  .refine(
    (result) =>
      !result.approvalRequired ||
      result.blocking ||
      (Boolean(result.approvedBy) &&
        Boolean(result.approvedAt) &&
        Boolean(result.approvalReason)),
    "Approval-required adapter results require approval metadata or must remain blocking"
  )
  .refine(
    (result) =>
      result.status !== "rejected" ||
      result.diagnostics.some((diagnostic) => diagnostic.severity === "error"),
    "Rejected adapter results require at least one error diagnostic"
  )
  .refine(
    (result) => result.status !== "manual-review" || result.approvalRequired,
    "Manual-review adapter results must require approval"
  )
  .refine(
    (result) =>
      result.status !== "unsupported" && result.status !== "rejected" ||
      result.blocking,
    "Unsupported and rejected adapter results must be blocking"
  )
  .refine(
    (result) =>
      result.fieldMappings.every(
        (mapping) =>
          mapping.status !== "mapped" ||
          mapping.lossiness === undefined ||
          mapping.lossiness === "none"
      ),
    "Mapped field mappings cannot be lossy"
  );

export const afendaAdapterContract = {
  id: AFENDA_ADAPTER_CONTRACT_ID,
  version: AFENDA_ADAPTER_CONTRACT_VERSION,
  sourceAuthority: "legacy inputs are migration sources only",
  canonicalAuthority: "canonical Afenda contracts are the only adapter targets",
  statuses: AFENDA_ADAPTER_STATUSES,
  diagnosticSeverities: AFENDA_ADAPTER_DIAGNOSTIC_SEVERITIES,
  sourceTypes: AFENDA_ADAPTER_SOURCE_TYPES,
  targetContractIds: AFENDA_ADAPTER_TARGET_CONTRACT_IDS,
  mappingTransforms: AFENDA_ADAPTER_MAPPING_TRANSFORMS,
  mappingLossiness: AFENDA_ADAPTER_MAPPING_LOSSINESS,
  governanceReferences: AFENDA_ADAPTER_GOVERNANCE_REFERENCES,
} as const;

export function validateAfendaAdapterResult(result: AfendaAdapterResult): void {
  afendaAdapterResultSchema.parse(result);
}
