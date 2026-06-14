import { defineGovernanceReferences } from "../../registry.schema";
import {
  AFENDA_GOV_ADAPTER,
  AFENDA_GOV_AGENT_GOVERNANCE,
  AFENDA_GOV_AUDIT,
  AFENDA_GOV_DESIGN_SYSTEM,
  AFENDA_GOV_MIGRATION_BOUNDARY,
  AFENDA_GOV_PERMISSION,
  AFENDA_GOV_RISK_POLICY,
  AFENDA_GOV_TENANT_CONTEXT,
  AFENDA_GOV_THEME_TOKEN,
  AFENDA_GOV_THEMING,
  XFORGE_GOV_PERMISSION_PIPELINE,
} from "../catalogs/governance-reference.catalog";
import {
  AFENDA_FORBIDDEN_CUSTOMIZATION_KEYS,
} from "../design-system.contract";
import {
  AFENDA_THEME_PRESET_NAMES,
  type AfendaThemePresetName,
} from "../registries/theme-preset.registry";
import { validateLegacyAdapterRejectedPathsAlignment } from "./legacy-adapter.utility";
import {
  type AfendaAdapterDiagnostic,
  type AfendaAdapterFieldMapping,
  type AfendaAdapterResult,
  type AfendaAdapterSource,
  validateAfendaAdapterResult,
} from "./adapter.contract";

export const AFENDA_LEGACY_THEME_PRESET_ADAPTER_ID =
  "afenda.adapters.legacy-theme-preset" as const;

export const AFENDA_LEGACY_THEME_PRESET_CANONICAL_NAMES = AFENDA_THEME_PRESET_NAMES;

export const AFENDA_LEGACY_THEME_PRESET_REJECTED_AUTHORITY_PATHS =
  AFENDA_FORBIDDEN_CUSTOMIZATION_KEYS;

export const AFENDA_LEGACY_THEME_PRESET_ADAPTER_GOVERNANCE_REFERENCES =
  defineGovernanceReferences([
    AFENDA_GOV_ADAPTER,
    AFENDA_GOV_THEME_TOKEN,
    AFENDA_GOV_THEMING,
    AFENDA_GOV_DESIGN_SYSTEM,
    AFENDA_GOV_TENANT_CONTEXT,
    AFENDA_GOV_PERMISSION,
    AFENDA_GOV_AUDIT,
    AFENDA_GOV_AGENT_GOVERNANCE,
    AFENDA_GOV_MIGRATION_BOUNDARY,
    AFENDA_GOV_RISK_POLICY,
    XFORGE_GOV_PERMISSION_PIPELINE,
  ]);

export type AfendaLegacyThemePresetAdapterInput = {
  source: AfendaAdapterSource & {
    type: "legacy-theme-preset";
  };
  legacyPresetName: string;
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

function normalizePresetName(name: string): string {
  return name.trim().toLowerCase();
}

export function normalizeLegacyThemePresetName(name: string): AfendaThemePresetName {
  const normalized = normalizePresetName(name);

  if (
    AFENDA_LEGACY_THEME_PRESET_CANONICAL_NAMES.some(
      (presetName) => presetName === normalized
    )
  ) {
    return normalized as AfendaThemePresetName;
  }

  throw new Error(`Unsupported legacy theme preset name: ${name}`);
}

function isCanonicalThemePresetName(name: string): boolean {
  const normalizedName = normalizePresetName(name);

  return AFENDA_LEGACY_THEME_PRESET_CANONICAL_NAMES.some(
    (presetName) => presetName === normalizedName
  );
}

function isRejectedAuthorityPath(sourcePath: string): boolean {
  return AFENDA_LEGACY_THEME_PRESET_REJECTED_AUTHORITY_PATHS.some((path) =>
    sourcePath.includes(path)
  );
}

function normalizeMapping(mapping: AfendaAdapterFieldMapping) {
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
      "Legacy authority field rejected from theme preset migration.",
  } as const;
}

function createRejectedAuthorityDiagnostic(
  mapping: AfendaAdapterFieldMapping
): AfendaAdapterDiagnostic {
  return {
    diagnosticId: `legacy-theme-preset-rejected-${mapping.sourcePath.replace(
      /[^a-zA-Z0-9]+/g,
      "-"
    )}`,
    severity: "error",
    code: "legacy-theme-preset.security-authority-rejected",
    message:
      "Legacy authority fields must not migrate into canonical theme preset contracts.",
    sourcePath: mapping.sourcePath,
    targetPath: mapping.targetPath,
    remediation:
      "Keep permission, tenant, company, audit, execution, mutation, and business authority in their owning pipelines.",
    blocking: true,
    ruleId: "anti-pattern.client-only-authorization",
    reference: XFORGE_GOV_PERMISSION_PIPELINE,
  };
}

function createManualThemeNameDiagnostic(
  legacyPresetName: string
): AfendaAdapterDiagnostic {
  return {
    diagnosticId: `legacy-theme-preset-manual-${legacyPresetName.replace(
      /[^a-zA-Z0-9]+/g,
      "-"
    )}`,
    severity: "warning",
    code: "legacy-theme-preset.unapproved-name",
    message:
      "Legacy theme preset name is not an approved canonical Afenda theme preset.",
    sourcePath: "themePreset.name",
    targetPath: "defaults.themePreset",
    remediation:
      "Map the legacy theme to afenda or vercel-geist, or add a governed canonical preset before migration.",
    blocking: false,
    reference: AFENDA_GOV_DESIGN_SYSTEM,
  };
}

function createPartialMappingDiagnostic(
  mapping: AfendaAdapterFieldMapping
): AfendaAdapterDiagnostic {
  return {
    diagnosticId: `legacy-theme-preset-partial-${mapping.sourcePath.replace(
      /[^a-zA-Z0-9]+/g,
      "-"
    )}`,
    severity: mapping.status === "rejected" ? "error" : "warning",
    code: `legacy-theme-preset.${mapping.status}`,
    message:
      "Legacy theme preset mapping is not a direct canonical theme preset mapping.",
    sourcePath: mapping.sourcePath,
    targetPath: mapping.targetPath,
    remediation:
      mapping.reason ??
      "Review the legacy preset field and confirm the canonical Afenda target mapping.",
    blocking: mapping.status === "rejected",
    reference: AFENDA_GOV_ADAPTER,
  };
}

function isApproved(input: AfendaLegacyThemePresetAdapterInput): boolean {
  return Boolean(input.approvedBy && input.approvedAt && input.approvalReason);
}

function resolveLegacyThemePresetAdapterStatus(params: {
  hasRejectedAuthority: boolean;
  hasUnapprovedThemeName: boolean;
  hasNonMappedFields: boolean;
}): AfendaAdapterResult["status"] {
  if (params.hasRejectedAuthority) {
    return "rejected";
  }

  if (params.hasUnapprovedThemeName) {
    return "manual-review";
  }

  if (params.hasNonMappedFields) {
    return "partial";
  }

  return "mapped";
}

export function validateAfendaLegacyThemePresetAdapterAlignment(): void {
  if (
    AFENDA_LEGACY_THEME_PRESET_CANONICAL_NAMES.join("|") !==
    AFENDA_THEME_PRESET_NAMES.join("|")
  ) {
    throw new Error(
      "AFENDA_LEGACY_THEME_PRESET_CANONICAL_NAMES must derive from AFENDA_THEME_PRESET_NAMES"
    );
  }

  validateLegacyAdapterRejectedPathsAlignment(
    AFENDA_LEGACY_THEME_PRESET_REJECTED_AUTHORITY_PATHS,
    AFENDA_FORBIDDEN_CUSTOMIZATION_KEYS,
    "AFENDA_LEGACY_THEME_PRESET_REJECTED_AUTHORITY_PATHS"
  );
}

export function createAfendaLegacyThemePresetAdapterResult(
  input: AfendaLegacyThemePresetAdapterInput
): AfendaAdapterResult {
  if (input.source.type !== "legacy-theme-preset") {
    throw new Error(
      "Legacy theme preset adapter only accepts legacy-theme-preset sources"
    );
  }

  const normalizedMappings = input.fieldMappings.map(normalizeMapping);
  const hasRejectedAuthority = normalizedMappings.some(
    (mapping) => mapping.status === "rejected"
  );
  const hasNonMappedFields = normalizedMappings.some(
    (mapping) => mapping.status !== "mapped"
  );
  const hasUnapprovedThemeName = !isCanonicalThemePresetName(
    input.legacyPresetName
  );
  const requiresApproval = hasRejectedAuthority || hasUnapprovedThemeName;
  const approved = isApproved(input);
  const diagnostics = [
    ...(hasUnapprovedThemeName
      ? [createManualThemeNameDiagnostic(input.legacyPresetName)]
      : []),
    ...input.fieldMappings
      .filter(
        (mapping) =>
          mapping.status !== "mapped" &&
          !isRejectedAuthorityPath(mapping.sourcePath)
      )
      .map(createPartialMappingDiagnostic),
    ...input.fieldMappings
      .filter((mapping) => isRejectedAuthorityPath(mapping.sourcePath))
      .map(createRejectedAuthorityDiagnostic),
  ];

  const result: AfendaAdapterResult = {
    adapterId: AFENDA_LEGACY_THEME_PRESET_ADAPTER_ID,
    source: input.source,
    target: {
      contractId: "afenda.theme-token-contract",
      version: input.targetVersion ?? "0.1.0",
    },
    status: resolveLegacyThemePresetAdapterStatus({
      hasRejectedAuthority,
      hasUnapprovedThemeName,
      hasNonMappedFields,
    }),
    blocking: hasRejectedAuthority || (requiresApproval && !approved),
    approvalRequired: requiresApproval,
    confidence: hasRejectedAuthority
      ? 0.6
      : hasUnapprovedThemeName
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
