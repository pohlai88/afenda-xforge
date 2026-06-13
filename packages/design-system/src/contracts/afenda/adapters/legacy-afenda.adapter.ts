import {
  type AfendaAdapterDiagnostic,
  type AfendaAdapterResult,
  type AfendaAdapterSource,
  type AfendaAdapterStatus,
  validateAfendaAdapterResult,
} from "./adapter.contract";

export const AFENDA_LEGACY_AFENDA_ADAPTER_ID =
  "afenda.adapters.legacy-afenda" as const;

export const AFENDA_LEGACY_AFENDA_ALLOWED_CHILD_ADAPTER_IDS = [
  "afenda.adapters.legacy-token",
  "afenda.adapters.legacy-theme-preset",
  "afenda.adapters.legacy-component-variant",
] as const;

export const AFENDA_LEGACY_AFENDA_ADAPTER_GOVERNANCE_REFERENCES = [
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
  "AFENDA:migration-boundary",
  "AFENDA:approval-policy-contract",
  "AFENDA:risk-policy-contract",
  "XFORGE:permission-pipeline",
] as const;

export type AfendaLegacyAfendaAdapterInput = {
  source: AfendaAdapterSource & {
    type: "legacy-afenda";
  };
  childResults: readonly AfendaAdapterResult[];
  migratedAt: string;
  migratedBy: string;
  targetVersion?: string;
  approvedBy?: string;
  approvedAt?: string;
  approvalReason?: string;
  auditEventId?: string;
  correlationId?: string;
};

function isApproved(input: AfendaLegacyAfendaAdapterInput): boolean {
  return Boolean(input.approvedBy && input.approvedAt && input.approvalReason);
}

function resolveLegacyAfendaAdapterStatus(
  childResults: readonly AfendaAdapterResult[]
): AfendaAdapterStatus {
  if (childResults.length === 0) {
    return "unsupported";
  }

  if (childResults.some((result) => result.status === "rejected")) {
    return "rejected";
  }

  if (childResults.some((result) => result.status === "unsupported")) {
    return "unsupported";
  }

  if (childResults.some((result) => result.status === "manual-review")) {
    return "manual-review";
  }

  if (childResults.some((result) => result.status === "partial")) {
    return "partial";
  }

  return "mapped";
}

function isAllowedChildAdapter(result: AfendaAdapterResult): boolean {
  return AFENDA_LEGACY_AFENDA_ALLOWED_CHILD_ADAPTER_IDS.includes(
    result.adapterId as (typeof AFENDA_LEGACY_AFENDA_ALLOWED_CHILD_ADAPTER_IDS)[number]
  );
}

function createEmptyAggregateDiagnostic(): AfendaAdapterDiagnostic {
  return {
    diagnosticId: "legacy-afenda-empty-aggregate",
    severity: "error",
    code: "legacy-afenda.no-child-results",
    message:
      "Legacy Afenda aggregate adapter requires at least one child adapter result.",
    remediation:
      "Run token, theme preset, or component variant adapters before aggregating legacy Afenda migration results.",
    blocking: true,
    reference: "AFENDA:adapter-contract",
  };
}

function createUnsupportedChildDiagnostics(
  childResults: readonly AfendaAdapterResult[]
): AfendaAdapterDiagnostic[] {
  return childResults
    .filter((result) => !isAllowedChildAdapter(result))
    .map((result) => ({
      diagnosticId: `legacy-afenda-unsupported-child-${result.adapterId.replace(
        /[^a-zA-Z0-9]+/g,
        "-"
      )}`,
      severity: "error",
      code: "legacy-afenda.unsupported-child-adapter",
      message:
        "Legacy Afenda aggregate adapter received a child result from an unsupported adapter.",
      remediation:
        "Aggregate only legacy token, legacy theme preset, and legacy component variant adapter results.",
      blocking: true,
      reference: "AFENDA:adapter-contract",
      metadata: {
        childAdapterId: result.adapterId,
        childStatus: result.status,
      },
    }));
}

function createDuplicateTargetDiagnostics(
  childResults: readonly AfendaAdapterResult[]
): AfendaAdapterDiagnostic[] {
  const targetCounts = new Map<string, number>();

  for (const result of childResults) {
    for (const mapping of result.fieldMappings) {
      targetCounts.set(
        mapping.targetPath,
        (targetCounts.get(mapping.targetPath) ?? 0) + 1
      );
    }
  }

  return [...targetCounts.entries()]
    .filter(([, count]) => count > 1)
    .map(([targetPath]) => ({
      diagnosticId: `legacy-afenda-duplicate-target-${targetPath.replace(
        /[^a-zA-Z0-9]+/g,
        "-"
      )}`,
      severity: "warning",
      code: "legacy-afenda.duplicate-target-path",
      message:
        "Multiple child adapters map into the same canonical target path.",
      targetPath,
      remediation:
        "Review precedence and confirm which child adapter owns the canonical target mapping.",
      blocking: false,
      reference: "AFENDA:migration-boundary",
    }));
}

function createAggregateDiagnostic(
  childResults: readonly AfendaAdapterResult[]
): AfendaAdapterDiagnostic {
  return {
    diagnosticId: "legacy-afenda-aggregate-summary",
    severity: childResults.some((result) => result.blocking)
      ? "error"
      : "warning",
    code: "legacy-afenda.aggregate-status",
    message:
      "Legacy Afenda aggregate adapter includes child mappings that require migration governance review.",
    remediation:
      "Review child adapter diagnostics and resolve blocking or approval-required mappings before removing legacy inputs.",
    blocking: childResults.some((result) => result.blocking),
    reference: "AFENDA:migration-boundary",
    metadata: {
      childAdapterIds: childResults.map((result) => result.adapterId),
      childStatuses: childResults.map((result) => result.status),
      approvalRequiredChildAdapterIds: childResults
        .filter((result) => result.approvalRequired)
        .map((result) => result.adapterId),
    },
  };
}

export function createAfendaLegacyAfendaAdapterResult(
  input: AfendaLegacyAfendaAdapterInput
): AfendaAdapterResult {
  if (input.source.type !== "legacy-afenda") {
    throw new Error("Legacy Afenda adapter only accepts legacy-afenda sources");
  }

  const childResults = input.childResults;
  childResults.forEach(validateAfendaAdapterResult);
  const unsupportedChildDiagnostics =
    createUnsupportedChildDiagnostics(childResults);
  const duplicateTargetDiagnostics =
    createDuplicateTargetDiagnostics(childResults);
  const status = resolveLegacyAfendaAdapterStatus(childResults);
  const approvalRequired = childResults.some(
    (result) => result.approvalRequired
  );
  const blocking =
    status === "rejected" ||
    status === "unsupported" ||
    unsupportedChildDiagnostics.length > 0 ||
    childResults.some((result) => result.blocking) ||
    (approvalRequired && !isApproved(input));
  const childDiagnostics = childResults.flatMap((result) => result.diagnostics);
  const diagnostics =
    childResults.length === 0
      ? [createEmptyAggregateDiagnostic()]
      : [
          ...(status === "mapped" ? [] : [createAggregateDiagnostic(childResults)]),
          ...unsupportedChildDiagnostics,
          ...duplicateTargetDiagnostics,
          ...childDiagnostics,
        ];
  const confidence =
    childResults.length === 0
      ? 0
      : Math.min(...childResults.map((result) => result.confidence));

  const result: AfendaAdapterResult = {
    adapterId: AFENDA_LEGACY_AFENDA_ADAPTER_ID,
    source: input.source,
    target: {
      contractId: "afenda.design-system",
      version: input.targetVersion ?? "0.1.0",
      exportSubpath: "@repo/design-system/contracts/afenda",
    },
    status,
    blocking,
    approvalRequired,
    confidence,
    fieldMappings: childResults.flatMap((childResult) =>
      childResult.fieldMappings.map((mapping) => ({
        ...mapping,
        sourcePath: `${childResult.adapterId}.${mapping.sourcePath}`,
      }))
    ),
    diagnostics,
    migratedAt: input.migratedAt,
    migratedBy: input.migratedBy,
    ...(input.approvedBy ? { approvedBy: input.approvedBy } : {}),
    ...(input.approvedAt ? { approvedAt: input.approvedAt } : {}),
    ...(input.approvalReason ? { approvalReason: input.approvalReason } : {}),
    ...(input.auditEventId ? { auditEventId: input.auditEventId } : {}),
    ...(input.correlationId ? { correlationId: input.correlationId } : {}),
    metadata: {
      childAdapterIds: childResults.map((childResult) => childResult.adapterId),
      childStatuses: childResults.map((childResult) => childResult.status),
      approvalRequiredChildAdapterIds: childResults
        .filter((childResult) => childResult.approvalRequired)
        .map((childResult) => childResult.adapterId),
      duplicateTargetPaths: duplicateTargetDiagnostics
        .map((diagnostic) => diagnostic.targetPath)
        .filter((targetPath): targetPath is string => Boolean(targetPath)),
    },
  };

  validateAfendaAdapterResult(result);

  return result;
}
