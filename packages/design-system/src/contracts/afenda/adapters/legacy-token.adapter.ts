import { AFENDA_FORBIDDEN_CUSTOMIZATION_KEYS } from "../design-system.contract";
import {
  type AfendaAdapterDiagnostic,
  type AfendaAdapterFieldMapping,
  type AfendaAdapterResult,
  type AfendaAdapterSource,
  validateAfendaAdapterResult,
} from "./adapter.contract";
import { validateLegacyAdapterRejectedPathsAlignment } from "./legacy-adapter.utility";

export const AFENDA_LEGACY_TOKEN_ADAPTER_ID =
  "afenda.adapters.legacy-token" as const;

export const AFENDA_LEGACY_TOKEN_REJECTED_AUTHORITY_PATHS =
  AFENDA_FORBIDDEN_CUSTOMIZATION_KEYS;

export const AFENDA_LEGACY_TOKEN_ADAPTER_GOVERNANCE_REFERENCES = [
  "AFENDA:adapter-contract",
  "AFENDA:theme-token-contract",
  "AFENDA:runtime-reference-contract",
  "AFENDA:permission-contract",
  "AFENDA:tenant-context-contract",
  "AFENDA:audit-contract",
  "AFENDA:agent-governance-contract",
  "AFENDA:migration-boundary",
  "AFENDA:risk-policy-contract",
  "XFORGE:permission-pipeline",
  "XFORGE:tenant-company-scope",
] as const;

export type AfendaLegacyTokenAdapterInput = {
  source: AfendaAdapterSource & {
    type: "legacy-token";
  };
  fieldMappings: readonly AfendaAdapterFieldMapping[];
  migratedAt: string;
  migratedBy: string;
  targetVersion?: string;
  approvedBy?: string;
  approvedAt?: string;
  approvalReason?: string;
  auditEventId?: string;
  correlationId?: string;
};

function isRejectedAuthorityPath(sourcePath: string): boolean {
  return AFENDA_LEGACY_TOKEN_REJECTED_AUTHORITY_PATHS.some((path) =>
    sourcePath.includes(path)
  );
}

function isApproved(input: AfendaLegacyTokenAdapterInput): boolean {
  return Boolean(input.approvedBy && input.approvedAt && input.approvalReason);
}

function resolveLegacyTokenAdapterStatus(
  hasRejectedAuthority: boolean,
  hasNonMappedFields: boolean
): AfendaAdapterResult["status"] {
  if (hasRejectedAuthority) {
    return "manual-review";
  }

  if (hasNonMappedFields) {
    return "partial";
  }

  return "mapped";
}

function createRejectedAuthorityDiagnostic(
  mapping: AfendaAdapterFieldMapping
): AfendaAdapterDiagnostic {
  const targetsThemeToken = mapping.targetPath.includes("theme");

  return {
    diagnosticId: `legacy-token-rejected-${mapping.sourcePath.replace(
      /[^a-zA-Z0-9]+/g,
      "-"
    )}`,
    severity: "error",
    code: targetsThemeToken
      ? "legacy-token.authority-to-theme-token-rejected"
      : "legacy-token.security-authority-rejected",
    message:
      "Legacy authority fields must not migrate into canonical presentation token contracts.",
    sourcePath: mapping.sourcePath,
    targetPath: mapping.targetPath || "<rejected-authority>",
    remediation:
      "Keep permission, tenant, company, audit, execution, mutation, and business authority in their owning pipelines.",
    blocking: true,
    ruleId: "anti-pattern.client-only-authorization",
    reference: "XFORGE:permission-pipeline",
  };
}

function createPartialMappingDiagnostic(
  mapping: AfendaAdapterFieldMapping
): AfendaAdapterDiagnostic {
  return {
    diagnosticId: `legacy-token-partial-${mapping.sourcePath.replace(
      /[^a-zA-Z0-9]+/g,
      "-"
    )}`,
    severity: mapping.status === "rejected" ? "error" : "warning",
    code: `legacy-token.${mapping.status}`,
    message: "Legacy token mapping is not a direct canonical token mapping.",
    sourcePath: mapping.sourcePath,
    targetPath: mapping.targetPath,
    remediation:
      mapping.reason ??
      "Review the source token and confirm the canonical Afenda target mapping.",
    blocking: mapping.status === "rejected",
    reference: "AFENDA:adapter-contract",
  };
}

export function validateAfendaLegacyTokenAdapterAlignment(): void {
  validateLegacyAdapterRejectedPathsAlignment(
    AFENDA_LEGACY_TOKEN_REJECTED_AUTHORITY_PATHS,
    AFENDA_FORBIDDEN_CUSTOMIZATION_KEYS,
    "AFENDA_LEGACY_TOKEN_REJECTED_AUTHORITY_PATHS"
  );
}

export function createAfendaLegacyTokenAdapterResult(
  input: AfendaLegacyTokenAdapterInput
): AfendaAdapterResult {
  if (input.source.type !== "legacy-token") {
    throw new Error("Legacy token adapter only accepts legacy-token sources");
  }

  const rejectedAuthorityMappings = input.fieldMappings.filter((mapping) =>
    isRejectedAuthorityPath(mapping.sourcePath)
  );
  const diagnostics = [
    ...input.fieldMappings
      .filter(
        (mapping) =>
          mapping.status !== "mapped" &&
          !isRejectedAuthorityPath(mapping.sourcePath)
      )
      .map(createPartialMappingDiagnostic),
    ...rejectedAuthorityMappings.map(createRejectedAuthorityDiagnostic),
  ];
  const hasRejectedAuthority = rejectedAuthorityMappings.length > 0;
  const hasNonMappedFields = input.fieldMappings.some(
    (mapping) => mapping.status !== "mapped"
  );
  const approvalRequired = hasRejectedAuthority;
  const approved = isApproved(input);

  const result: AfendaAdapterResult = {
    adapterId: AFENDA_LEGACY_TOKEN_ADAPTER_ID,
    source: input.source,
    target: {
      contractId: "afenda.theme-token-contract",
      version: input.targetVersion ?? "0.1.0",
    },
    status: resolveLegacyTokenAdapterStatus(
      hasRejectedAuthority,
      hasNonMappedFields
    ),
    blocking: approvalRequired && !approved,
    approvalRequired,
    confidence: hasRejectedAuthority ? 0.65 : hasNonMappedFields ? 0.85 : 1,
    fieldMappings: input.fieldMappings.map((mapping) => {
      if (!isRejectedAuthorityPath(mapping.sourcePath)) {
        return mapping;
      }

      return {
        ...mapping,
        status: "rejected",
        transform: "drop",
        lossiness: "high",
        reason:
          mapping.reason ??
          "Legacy authority field rejected from presentation token migration.",
      };
    }),
    diagnostics,
    migratedAt: input.migratedAt,
    migratedBy: input.migratedBy,
    ...(input.approvedBy ? { approvedBy: input.approvedBy } : {}),
    ...(input.approvedAt ? { approvedAt: input.approvedAt } : {}),
    ...(input.approvalReason ? { approvalReason: input.approvalReason } : {}),
    ...(input.auditEventId ? { auditEventId: input.auditEventId } : {}),
    ...(input.correlationId ? { correlationId: input.correlationId } : {}),
  };

  validateAfendaAdapterResult(result);

  return result;
}
