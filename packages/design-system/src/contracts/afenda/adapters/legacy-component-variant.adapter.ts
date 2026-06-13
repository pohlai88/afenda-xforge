import { AFENDA_FORBIDDEN_CUSTOMIZATION_KEYS } from "../design-system.contract";
import {
  AFENDA_BADGE_VARIANTS as BADGE_VARIANTS,
  AFENDA_BUTTON_VARIANTS as BUTTON_VARIANTS,
  AFENDA_CARD_VARIANTS as CARD_VARIANTS,
  AFENDA_FIELD_VARIANTS as FIELD_VARIANTS,
  AFENDA_TABLE_VARIANTS as TABLE_VARIANTS,
} from "../registries/component-variant.registry";
import {
  type AfendaAdapterDiagnostic,
  type AfendaAdapterFieldMapping,
  type AfendaAdapterResult,
  type AfendaAdapterSource,
  validateAfendaAdapterResult,
} from "./adapter.contract";
import { validateLegacyAdapterRejectedPathsAlignment } from "./legacy-adapter.utility";

export const AFENDA_LEGACY_COMPONENT_VARIANT_ADAPTER_ID =
  "afenda.adapters.legacy-component-variant" as const;

export const AFENDA_LEGACY_COMPONENT_VARIANT_REJECTED_AUTHORITY_PATHS =
  AFENDA_FORBIDDEN_CUSTOMIZATION_KEYS;

export const AFENDA_LEGACY_COMPONENT_VARIANT_ADAPTER_GOVERNANCE_REFERENCES = [
  "AFENDA:adapter-contract",
  "AFENDA:component-variant-contract",
  "AFENDA:visual-design-contract",
  "AFENDA:interaction-contract",
  "AFENDA:accessibility-contract",
  "AFENDA:theme-token-contract",
  "AFENDA:status-tone-contract",
  "AFENDA:permission-contract",
  "AFENDA:tenant-context-contract",
  "AFENDA:audit-contract",
  "AFENDA:agent-governance-contract",
  "AFENDA:migration-boundary",
  "AFENDA:variant-promotion-contract",
  "AFENDA:risk-policy-contract",
  "XFORGE:permission-pipeline",
] as const;

export const AFENDA_COMPONENT_VARIANT_COMPONENT_TYPES = [
  "button",
  "badge",
  "card",
  "field",
  "table",
] as const;

export type AfendaComponentVariantComponentType =
  (typeof AFENDA_COMPONENT_VARIANT_COMPONENT_TYPES)[number];

export type AfendaLegacyComponentVariantAdapterInput = {
  source: AfendaAdapterSource & {
    type: "legacy-component-variant";
  };
  componentType: AfendaComponentVariantComponentType;
  legacyVariantName: string;
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

function normalizeVariantName(name: string): string {
  return name.trim().toLowerCase();
}

function getCanonicalVariantsForComponent(
  componentType: AfendaComponentVariantComponentType
): readonly string[] {
  if (componentType === "button") {
    return BUTTON_VARIANTS;
  }

  if (componentType === "badge") {
    return BADGE_VARIANTS;
  }

  if (componentType === "card") {
    return CARD_VARIANTS;
  }

  if (componentType === "field") {
    return FIELD_VARIANTS;
  }

  return TABLE_VARIANTS;
}

function isCanonicalVariantName(
  componentType: AfendaComponentVariantComponentType,
  variantName: string
): boolean {
  const normalizedName = normalizeVariantName(variantName);

  return getCanonicalVariantsForComponent(componentType).some(
    (variant) => normalizeVariantName(variant) === normalizedName
  );
}

function isRejectedAuthorityPath(sourcePath: string): boolean {
  return AFENDA_LEGACY_COMPONENT_VARIANT_REJECTED_AUTHORITY_PATHS.some((path) =>
    sourcePath.includes(path)
  );
}

function hasAuthorityTargetPath(mapping: AfendaAdapterFieldMapping): boolean {
  const normalizedTargetPath = mapping.targetPath.toLowerCase();

  return (
    isRejectedAuthorityPath(mapping.sourcePath) ||
    normalizedTargetPath.includes("permission") ||
    normalizedTargetPath.includes("tenant") ||
    normalizedTargetPath.includes("audit") ||
    normalizedTargetPath.includes("workflow") ||
    normalizedTargetPath.includes("mutation")
  );
}

function normalizeMapping(
  mapping: AfendaAdapterFieldMapping
): AfendaAdapterFieldMapping {
  if (!hasAuthorityTargetPath(mapping)) {
    return mapping;
  }

  return {
    ...mapping,
    status: "rejected",
    transform: "drop",
    lossiness: "high",
    reason:
      mapping.reason ??
      "Legacy authority field rejected from component variant migration.",
  } as const;
}

function createRejectedAuthorityDiagnostic(
  mapping: AfendaAdapterFieldMapping
): AfendaAdapterDiagnostic {
  return {
    diagnosticId: `legacy-component-variant-rejected-${mapping.sourcePath.replace(
      /[^a-zA-Z0-9]+/g,
      "-"
    )}`,
    severity: "error",
    code: "legacy-component-variant.security-authority-rejected",
    message:
      "Legacy authority fields must not migrate into canonical component variant contracts.",
    sourcePath: mapping.sourcePath,
    targetPath: mapping.targetPath,
    remediation:
      "Keep permission, tenant, company, audit, execution, mutation, and business authority in their owning pipelines.",
    blocking: true,
    ruleId: "anti-pattern.client-only-authorization",
    reference: "XFORGE:permission-pipeline",
  };
}

function createManualVariantDiagnostic(
  input: AfendaLegacyComponentVariantAdapterInput
): AfendaAdapterDiagnostic {
  return {
    diagnosticId: `legacy-component-variant-manual-${input.componentType}-${input.legacyVariantName.replace(
      /[^a-zA-Z0-9]+/g,
      "-"
    )}`,
    severity: "warning",
    code: "legacy-component-variant.unapproved-name",
    message:
      "Legacy component variant name is not approved for the target component type.",
    sourcePath: `${input.componentType}.variant`,
    targetPath: "componentVariant.variant",
    remediation:
      "Map this legacy variant to an existing canonical variant, or create a component-variant governance request with visual, interaction, accessibility, and token evidence.",
    blocking: false,
    reference: "AFENDA:component-variant-contract",
    metadata: {
      componentType: input.componentType,
      legacyVariantName: input.legacyVariantName,
    },
  };
}

function createVariantPromotionDiagnostic(
  input: AfendaLegacyComponentVariantAdapterInput
): AfendaAdapterDiagnostic {
  return {
    diagnosticId: `legacy-component-variant-promotion-${input.componentType}-${input.legacyVariantName.replace(
      /[^a-zA-Z0-9]+/g,
      "-"
    )}`,
    severity: "info",
    code: "legacy-component-variant.promotion-available",
    message:
      "Legacy variant may be promoted only through component variant governance.",
    sourcePath: `${input.componentType}.variant`,
    targetPath: "componentVariant.registry",
    remediation:
      "Provide visual, interaction, accessibility, token, and usage evidence before adding a new canonical variant.",
    blocking: false,
    reference: "AFENDA:variant-promotion-contract",
    metadata: {
      componentType: input.componentType,
      legacyVariantName: input.legacyVariantName,
    },
  };
}

function createPartialMappingDiagnostic(
  mapping: AfendaAdapterFieldMapping
): AfendaAdapterDiagnostic {
  return {
    diagnosticId: `legacy-component-variant-partial-${mapping.sourcePath.replace(
      /[^a-zA-Z0-9]+/g,
      "-"
    )}`,
    severity: mapping.status === "rejected" ? "error" : "warning",
    code: `legacy-component-variant.${mapping.status}`,
    message:
      "Legacy component variant mapping is not a direct canonical variant mapping.",
    sourcePath: mapping.sourcePath,
    targetPath: mapping.targetPath,
    remediation:
      mapping.reason ??
      "Review the legacy component variant field and confirm the canonical Afenda target mapping.",
    blocking: mapping.status === "rejected",
    reference: "AFENDA:adapter-contract",
  };
}

function isApproved(input: AfendaLegacyComponentVariantAdapterInput): boolean {
  return Boolean(input.approvedBy && input.approvedAt && input.approvalReason);
}

function resolveLegacyComponentVariantAdapterStatus(params: {
  hasRejectedAuthority: boolean;
  hasUnapprovedVariantName: boolean;
  hasNonMappedFields: boolean;
}): AfendaAdapterResult["status"] {
  if (params.hasRejectedAuthority) {
    return "rejected";
  }

  if (params.hasUnapprovedVariantName) {
    return "manual-review";
  }

  if (params.hasNonMappedFields) {
    return "partial";
  }

  return "mapped";
}

export function validateAfendaLegacyComponentVariantAdapterAlignment(): void {
  validateLegacyAdapterRejectedPathsAlignment(
    AFENDA_LEGACY_COMPONENT_VARIANT_REJECTED_AUTHORITY_PATHS,
    AFENDA_FORBIDDEN_CUSTOMIZATION_KEYS,
    "AFENDA_LEGACY_COMPONENT_VARIANT_REJECTED_AUTHORITY_PATHS"
  );
}

export function createAfendaLegacyComponentVariantAdapterResult(
  input: AfendaLegacyComponentVariantAdapterInput
): AfendaAdapterResult {
  if (input.source.type !== "legacy-component-variant") {
    throw new Error(
      "Legacy component variant adapter only accepts legacy-component-variant sources"
    );
  }

  const normalizedMappings = input.fieldMappings.map(normalizeMapping);
  const hasRejectedAuthority = normalizedMappings.some(
    (mapping) => mapping.status === "rejected"
  );
  const hasNonMappedFields = normalizedMappings.some(
    (mapping) => mapping.status !== "mapped"
  );
  const hasUnapprovedVariantName = !isCanonicalVariantName(
    input.componentType,
    input.legacyVariantName
  );
  const requiresApproval = hasRejectedAuthority || hasUnapprovedVariantName;
  const approved = isApproved(input);
  const diagnostics = [
    ...(hasUnapprovedVariantName ? [createManualVariantDiagnostic(input)] : []),
    ...input.fieldMappings
      .filter(
        (mapping) =>
          mapping.status !== "mapped" &&
          !hasAuthorityTargetPath(mapping)
      )
      .map(createPartialMappingDiagnostic),
    ...input.fieldMappings
      .filter((mapping) => hasAuthorityTargetPath(mapping))
      .map(createRejectedAuthorityDiagnostic),
    ...(hasUnapprovedVariantName
      ? [createVariantPromotionDiagnostic(input)]
      : []),
  ];

  const result: AfendaAdapterResult = {
    adapterId: AFENDA_LEGACY_COMPONENT_VARIANT_ADAPTER_ID,
    source: input.source,
    target: {
      contractId: "afenda.component-variant-contract",
      version: input.targetVersion ?? "0.1.0",
    },
    status: resolveLegacyComponentVariantAdapterStatus({
      hasRejectedAuthority,
      hasUnapprovedVariantName,
      hasNonMappedFields,
    }),
    blocking: hasRejectedAuthority || (requiresApproval && !approved),
    approvalRequired: requiresApproval,
    confidence: hasRejectedAuthority
      ? 0.6
      : hasUnapprovedVariantName
        ? 0.8
        : hasNonMappedFields
          ? 0.9
          : 1,
    fieldMappings: normalizedMappings,
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
