import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { dirname, isAbsolute, relative, resolve, sep } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import {
  AFENDA_CONTRACT_EXPORT_SUBPATH,
  AFENDA_AGENT_GOVERNANCE_ACTIONS,
  AFENDA_AGENT_GOVERNANCE_CONTRACT_ID,
  AFENDA_AGENT_GOVERNANCE_FORBIDDEN_ACTIONS,
  AFENDA_AGENT_GOVERNANCE_GOVERNANCE_REFERENCES,
  AFENDA_AGENT_GOVERNANCE_POLICY_TYPES,
  AFENDA_AGENT_GOVERNANCE_QUALITY_GATES,
  AFENDA_AGENT_GOVERNANCE_RISK_LEVELS,
  AFENDA_AGENT_GOVERNANCE_TRIGGERS,
  AFENDA_ADAPTER_CONTRACT_ID,
  AFENDA_ADAPTER_DIAGNOSTIC_SEVERITIES,
  AFENDA_ADAPTER_GOVERNANCE_REFERENCES,
  AFENDA_ADAPTER_MAPPING_LOSSINESS,
  AFENDA_ADAPTER_MAPPING_TRANSFORMS,
  AFENDA_ADAPTER_SOURCE_TYPES,
  AFENDA_ADAPTER_STATUSES,
  AFENDA_ADAPTER_TARGET_CONTRACT_IDS,
  AFENDA_LEGACY_AFENDA_ADAPTER_GOVERNANCE_REFERENCES,
  AFENDA_LEGACY_AFENDA_ADAPTER_ID,
  AFENDA_LEGACY_AFENDA_ALLOWED_CHILD_ADAPTER_IDS,
  AFENDA_LEGACY_THEME_PRESET_ADAPTER_ID,
  AFENDA_LEGACY_THEME_PRESET_ADAPTER_GOVERNANCE_REFERENCES,
  AFENDA_LEGACY_THEME_PRESET_CANONICAL_NAMES,
  AFENDA_LEGACY_THEME_PRESET_REJECTED_AUTHORITY_PATHS,
  AFENDA_LEGACY_COMPONENT_VARIANT_ADAPTER_ID,
  AFENDA_LEGACY_COMPONENT_VARIANT_ADAPTER_GOVERNANCE_REFERENCES,
  AFENDA_LEGACY_COMPONENT_VARIANT_REJECTED_AUTHORITY_PATHS,
  AFENDA_LEGACY_DEPRECATED_EXPORTS,
  AFENDA_LEGACY_DEPRECATION_GOVERNANCE_REFERENCES,
  AFENDA_LEGACY_DEPRECATION_ID,
  AFENDA_LEGACY_DEPRECATION_POLICIES,
  AFENDA_LEGACY_MIGRATION_TARGETS,
  AFENDA_LEGACY_TOKEN_ADAPTER_ID,
  AFENDA_LEGACY_TOKEN_ADAPTER_GOVERNANCE_REFERENCES,
  AFENDA_LEGACY_TOKEN_REJECTED_AUTHORITY_PATHS,
  AFENDA_MODULE_LANE_CATALOG_ID,
  AFENDA_MODULE_LANE_GOVERNANCE_REFERENCES,
  AFENDA_MODULE_LANE_PREFIX_RULES,
  AFENDA_CHART_COLOR_TOKENS,
  AFENDA_CHART_GOVERNANCE_REFERENCES,
  AFENDA_CHART_HUES,
  AFENDA_CHART_REGISTRY_ID,
  AFENDA_CHART_USAGE_CONTRACT_ID,
  AFENDA_CHART_USAGE_GOVERNANCE_REFERENCES,
  AFENDA_CHART_USAGE_SCENARIOS,
  AFENDA_COLOR_USAGE_RATIO,
  AFENDA_ERP_VISUAL_LANE_IDS,
  AFENDA_ERP_VISUAL_LANES,
  AFENDA_ERP_CATALOG_MODULE_ENTRIES,
  AFENDA_ERP_MODULE_LANE_DEFAULT_LANE,
  AFENDA_ERP_MODULE_LANE_DEFAULTS,
  AFENDA_COLOR_TOKEN_REGISTRY_ID,
  AFENDA_COLOR_TOKEN_GOVERNANCE_REFERENCES,
  AFENDA_BASE_COLOR_TOKENS,
  AFENDA_BRAND_COLOR_TOKENS,
  AFENDA_SEMANTIC_COLOR_TOKENS,
  AFENDA_STATUS_COLOR_TOKENS,
  AFENDA_STATUS_INTENTS,
  AFENDA_STATUS_TONE_GOVERNANCE_REFERENCES,
  AFENDA_STATUS_TONE_REGISTRY_ID,
  AFENDA_STATUS_TONES,
  AFENDA_COMPONENT_SIZE_GOVERNANCE_REFERENCES,
  AFENDA_COMPONENT_SIZE_REGISTRY_ID,
  AFENDA_COMPONENT_SIZES,
  AFENDA_COMPONENT_VARIANT_GOVERNANCE_REFERENCES,
  AFENDA_COMPONENT_VARIANT_REGISTRY_ID,
  AFENDA_CONTROL_SIZES,
  AFENDA_DENSITY_GOVERNANCE_REFERENCES,
  AFENDA_DENSITY_MODES,
  AFENDA_DENSITY_REGISTRY_ID,
  AFENDA_DENSITY_TOKEN_BINDINGS,
  AFENDA_DENSITY_TOKEN_NAMES,
  AFENDA_ALLOWED_CUSTOMIZATION_KEYS,
  AFENDA_FORBIDDEN_CUSTOMIZATION_KEYS,
  AFENDA_DESIGN_SYSTEM_ID,
  AFENDA_DESIGN_SYSTEM_PUBLIC_EXPORTS,
  AFENDA_THEME_PRESETS,
  AFENDA_THEME_PRESET_NAMES,
  AFENDA_FONT_GOVERNANCE_REFERENCES,
  AFENDA_FONT_PRESET_NAMES,
  AFENDA_FONT_PRESETS,
  AFENDA_FONT_REGISTRY_ID,
  AFENDA_FONT_ROLES,
  AFENDA_TENANT_BRANDING_CONTRACT_ID,
  AFENDA_TENANT_BRANDING_ALLOWED_CUSTOMIZATION_KEYS,
  AFENDA_TENANT_BRANDING_DEFERRED_CUSTOMIZATION_KEYS,
  AFENDA_TENANT_BRANDING_IMPLEMENTED_CUSTOMIZATION_KEYS,
  AFENDA_TENANT_BRANDING_GOVERNANCE_REFERENCES,
  AFENDA_USER_BRANDING_CONTRACT_ID,
  AFENDA_USER_BRANDING_GOVERNANCE_REFERENCES,
  AFENDA_FORM_ENGINE_MODES,
  AFENDA_FORM_FIELD_BINDINGS,
  AFENDA_FORM_FRAMEWORK_REQUIREMENTS,
  AFENDA_FORM_VARIANT_STATES,
  AFENDA_FORM_VALIDATION_REQUIREMENTS,
  AFENDA_COLOR_HUE_SYSTEM,
  AFENDA_HUE_RESERVATION_CONTRACT_ID,
  AFENDA_HUE_RESERVATION_GOVERNANCE_REFERENCES,
  AFENDA_HUE_RESERVATION_POLICY_ID,
  AFENDA_MIN_HUE_SEPARATION,
  AFENDA_QUALITY_GATE_CONTRACT_ID,
  AFENDA_QUALITY_GATE_STATUSES,
  AFENDA_RADIUS_GOVERNANCE_REFERENCES,
  AFENDA_RADIUS_REGISTRY_ID,
  AFENDA_RADIUS_SOURCE_TOKENS,
  AFENDA_RADIUS_TOKENS,
  AFENDA_REMEDIATION_ACTION_TYPES,
  AFENDA_REMEDIATION_AUTOMATION_LEVELS,
  AFENDA_REMEDIATION_CONTRACT_ID,
  AFENDA_REMEDIATION_GOVERNANCE_REFERENCES,
  AFENDA_REMEDIATION_REVIEW_GATES,
  AFENDA_REMEDIATION_RISK_LEVELS,
  AFENDA_REMEDIATION_STATUSES,
  AFENDA_RULE_GROUPS,
  AFENDA_RULE_REGISTRY,
  AFENDA_RULE_EVALUATION_CONTRACT_ID,
  AFENDA_RULE_EVALUATION_ACTORS,
  AFENDA_RULE_EVALUATION_EVIDENCE_TYPES,
  AFENDA_RULE_EVALUATION_GOVERNANCE_REFERENCES,
  AFENDA_RULE_EVALUATION_STATUSES,
  AFENDA_RULE_EVALUATION_SUBJECT_TYPES,
  AFENDA_RUNTIME_REFERENCE_ID,
  AFENDA_RUNTIME_RULE_CATEGORIES,
  AFENDA_RUNTIME_RULES,
  AFENDA_BADGE_VARIANTS,
  AFENDA_BUTTON_VARIANTS,
  AFENDA_FIELD_VARIANTS,
  AFENDA_FORM_STATES,
  AFENDA_TABLE_STATES,
  AFENDA_TABLE_VARIANTS,
  AFENDA_TABLE_SIZES,
  AFENDA_VIOLATION_CONTRACT_ID,
  AFENDA_VIOLATION_EVALUATION_STATUSES,
  AFENDA_VIOLATION_GOVERNANCE_REFERENCES,
  AFENDA_VIOLATION_PRIORITIES,
  AFENDA_VIOLATION_STATUSES,
  AFENDA_LANE_COLOR_SCALE_FIELDS,
  AFENDA_VISUAL_LANE_GOVERNANCE_REFERENCES,
  AFENDA_VISUAL_LANE_REGISTRY_ID,
  afendaAgentGovernanceContract,
  afendaAdapterContract,
  afendaChartRegistry,
  afendaChartUsageContract,
  afendaColorTokenRegistry,
  afendaComponentSizeRegistry,
  afendaComponentVariantRegistry,
  afendaDensityRegistry,
  afendaDesignSystemContract,
  afendaDesignSystemManifest,
  afendaFontRegistry,
  afendaHueReservationContract,
  afendaRadiusRegistry,
  afendaTenantBrandingContract,
  afendaTenantBrandingSettingsSchema,
  afendaUserBrandingContract,
  afendaUserBrandingPreferencesSchema,
  afendaLegacyDeprecationManifest,
  afendaModuleLaneCatalog,
  afendaQualityGateContract,
  afendaRemediationContract,
  afendaRuleEvaluationContract,
  afendaViolationContract,
  afendaRuntimeReferenceContract,
  afendaVisualLaneRegistry,
  afendaStatusToneRegistry,
  getAfendaRuntimeRule,
  getAfendaRuleRegistryRule,
  validateAfendaDesignSystemContract,
  validateAfendaDesignSystemManifest,
  validateAfendaTenantBrandingContract,
  validateAfendaUserBrandingContract,
  validateAfendaLegacyDeprecationManifest,
  validateAfendaModuleLaneCatalog,
  validateAfendaQualityGateContract,
  validateAfendaQualityGateDecision,
  validateAfendaRuleRegistry,
  validateAfendaAgentGovernanceContract,
  validateAfendaAgentGovernanceDecision,
  validateAfendaAdapterResult,
  validateAfendaChartRegistry,
  validateAfendaChartUsageContract,
  validateAfendaColorTokenRegistry,
  validateAfendaComponentSizeRegistry,
  validateAfendaComponentVariantRegistry,
  validateAfendaDensityRegistry,
  validateAfendaFontRegistry,
  validateAfendaHueReservation,
  validateAfendaHueReservationContract,
  validateAfendaRadiusRegistry,
  createAfendaLegacyAfendaAdapterResult,
  createAfendaLegacyComponentVariantAdapterResult,
  validateAfendaLegacyComponentVariantAdapterAlignment,
  createAfendaLegacyThemePresetAdapterResult,
  validateAfendaLegacyThemePresetAdapterAlignment,
  normalizeLegacyThemePresetName,
  createAfendaLegacyTokenAdapterResult,
  validateAfendaLegacyTokenAdapterAlignment,
  getAfendaDefaultLaneForFeature,
  collectAfendaReservedStatusHueEntries,
  validateAfendaRemediationBatch,
  validateAfendaRemediationPlan,
  validateAfendaRuleEvaluationBatch,
  validateAfendaRuleEvaluationResult,
  validateAfendaRuntimeReferenceContract,
  validateAfendaStatusToneRegistry,
  validateAfendaViolation,
  validateAfendaViolationBatch,
  validateAfendaVisualLaneRegistry,
} from "../contracts/afenda";
import {
  AFENDA_ACCESSIBILITY_RULES,
  AFENDA_APCA_CONTRAST_TARGETS,
  AFENDA_ADMIN_SHELL_RULES,
  AFENDA_ANTI_PATTERN_RULES,
  AFENDA_AUDIT_RULES,
  AFENDA_CONTENT_RULES,
  AFENDA_COPY_RULES,
  AFENDA_DATA_DISPLAY_RULES,
  AFENDA_FEEDBACK_RULES,
  AFENDA_FOCUS_RULES,
  AFENDA_FORMS_RULES,
  AFENDA_HYDRATION_RULES,
  AFENDA_IMAGES_RULES,
  AFENDA_INTERACTION_RULES,
  AFENDA_LAYOUT_RULES,
  AFENDA_LOCALE_RULES,
  AFENDA_MOTION_RULES,
  AFENDA_MUTATION_RULES,
  AFENDA_NAVIGATION_RULES,
  AFENDA_OBSERVABILITY_RULES,
  AFENDA_PERFORMANCE_THRESHOLDS,
  AFENDA_PERFORMANCE_RULES,
  AFENDA_ROUTE_STATE_RULES,
  AFENDA_SECURITY_UI_RULES,
  AFENDA_SEMANTICS_RULES,
  AFENDA_TENANT_CONTEXT_RULES,
  AFENDA_THEMING_RULES,
  AFENDA_TOUCH_LAYOUT_RULES,
  AFENDA_TYPOGRAPHY_RULES,
  AFENDA_VISUAL_DESIGN_RULES,
} from "../contracts/afenda/rules";
import {
  DESIGN_SYSTEM_REGISTRY_ENTRY_PATTERN,
  defineRegistry,
  designSystemRegistryEntrySchema,
  validateDesignSystemRegistry,
} from "../contracts/registry.schema";

type PackageJsonWithExports = {
  exports: Record<string, string>;
};

const CONTRACTS_ROOT = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "../contracts"
);

const CONTRACT_FILE_ROLE_SUFFIXES = [
  ".adapter.ts",
  ".catalog.ts",
  ".contract.ts",
  ".manifest.ts",
  ".registry.ts",
  ".rules.ts",
  ".schema.ts",
  ".utility.ts",
] as const;

const CONTRACT_INDEX_FILES = ["index.ts"] as const;
const CONTRACT_EXTERNAL_IMPORTS = ["zod"] as const;

function readPackageJson(): PackageJsonWithExports {
  return JSON.parse(
    readFileSync(new URL("../../package.json", import.meta.url), "utf8")
  ) as PackageJsonWithExports;
}

function resolvePackageExportSubpath(exportKey: string): string {
  if (exportKey === "./contracts") {
    return "@repo/design-system/contracts";
  }

  return `@repo/design-system${exportKey.slice(1)}`;
}

function listContractSourceFiles(directory = CONTRACTS_ROOT): readonly string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = resolve(directory, entry.name);

    if (entry.isDirectory()) {
      return [...listContractSourceFiles(entryPath)];
    }

    return entry.isFile() && entry.name.endsWith(".ts") ? [entryPath] : [];
  });
}

function toContractRelativePath(filePath: string): string {
  return relative(CONTRACTS_ROOT, filePath).split(sep).join("/");
}

function extractModuleSpecifiers(source: string): readonly string[] {
  return [
    ...source.matchAll(
      /^\s*(?:import\s+(?:type\s+)?(?:["']([^"']+)["']|[\s\S]*?\s+from\s+["']([^"']+)["'])|export\s+[\s\S]*?\s+from\s+["']([^"']+)["'])/gm
    ),
  ].map((match) => {
    const moduleSpecifier = match[1] ?? match[2] ?? match[3];

    assert.ok(moduleSpecifier, "Module specifier match must contain a path");

    return moduleSpecifier;
  });
}

function isAllowedContractFileName(filePath: string): boolean {
  const fileName = filePath.split(sep).at(-1);

  assert.ok(fileName, "Contract source file must have a file name");

  return (
    CONTRACT_INDEX_FILES.includes(
      fileName as (typeof CONTRACT_INDEX_FILES)[number]
    ) ||
    CONTRACT_FILE_ROLE_SUFFIXES.some((suffix) => fileName.endsWith(suffix))
  );
}

function isPathInsideContracts(filePath: string): boolean {
  const relativePath = relative(CONTRACTS_ROOT, filePath);

  return (
    relativePath !== "" &&
    !relativePath.startsWith("..") &&
    !isAbsolute(relativePath)
  );
}

test("design system registry schema validates canonical registry entries", () => {
  assert.ok(DESIGN_SYSTEM_REGISTRY_ENTRY_PATTERN.test("button-primary"));
  assert.equal(designSystemRegistryEntrySchema.parse("  button-primary  "), "button-primary");
  assert.deepEqual(validateDesignSystemRegistry(["button", "button-primary"]), [
    "button",
    "button-primary",
  ]);
  assert.deepEqual(defineRegistry(["button", "button-primary"]), [
    "button",
    "button-primary",
  ]);
});

test("design system registry schema rejects invalid registry entries", () => {
  assert.throws(() => validateDesignSystemRegistry([]));
  assert.throws(() => validateDesignSystemRegistry(["Button"]));
  assert.throws(() => validateDesignSystemRegistry(["button_primary"]));
  assert.throws(() => validateDesignSystemRegistry(["button", "button"]));
});

test("contract files use governed role naming", () => {
  const invalidContractFiles = listContractSourceFiles()
    .filter((filePath) => !isAllowedContractFileName(filePath))
    .map(toContractRelativePath);

  assert.deepEqual(invalidContractFiles, []);
});

test("contract imports stay inside the contract boundary", () => {
  const boundaryViolations = listContractSourceFiles().flatMap((filePath) => {
    const source = readFileSync(filePath, "utf8");

    return extractModuleSpecifiers(source).flatMap((moduleSpecifier) => {
      if (moduleSpecifier.startsWith(".")) {
        const resolvedImportPath = resolve(dirname(filePath), moduleSpecifier);

        return isPathInsideContracts(resolvedImportPath)
          ? []
          : [
              `${toContractRelativePath(filePath)} imports outside contracts: ${moduleSpecifier}`,
            ];
      }

      return CONTRACT_EXTERNAL_IMPORTS.includes(
        moduleSpecifier as (typeof CONTRACT_EXTERNAL_IMPORTS)[number]
      )
        ? []
        : [
            `${toContractRelativePath(filePath)} imports non-contract dependency: ${moduleSpecifier}`,
          ];
    });
  });

  assert.deepEqual(boundaryViolations, []);
});

test("afenda design system contract validates as canonical authority", () => {
  validateAfendaDesignSystemContract();

  assert.equal(afendaDesignSystemContract.id, AFENDA_DESIGN_SYSTEM_ID);
  assert.equal(
    afendaDesignSystemContract.runtimeReference.id,
    AFENDA_RUNTIME_REFERENCE_ID
  );
  assert.equal(afendaDesignSystemContract.defaults.themePreset, "vercel-geist");
  assert.deepEqual([...AFENDA_THEME_PRESETS], [...AFENDA_THEME_PRESET_NAMES]);
  assert.ok(
    afendaDesignSystemContract.governance.principles.some((principle) =>
      principle.includes("old token contracts are migration inputs")
    )
  );
});

test("afenda tenant branding contract governs safe customization only", () => {
  validateAfendaTenantBrandingContract();

  assert.equal(
    afendaTenantBrandingContract.id,
    AFENDA_TENANT_BRANDING_CONTRACT_ID
  );
  assert.equal(afendaTenantBrandingContract.defaults.themePreset, "afenda");
  assert.ok(
    AFENDA_TENANT_BRANDING_GOVERNANCE_REFERENCES.includes(
      "AFENDA:tenant-context-contract"
    )
  );
  assert.ok(
    afendaTenantBrandingContract.forbiddenCustomization.includes(
      "permissionFinality"
    )
  );
  assert.throws(() =>
    afendaTenantBrandingSettingsSchema.parse({
      themePreset: "xforge",
    })
  );
  assert.equal(
    afendaTenantBrandingSettingsSchema.parse({
      themePreset: "afenda",
      density: "compact",
    }).density,
    "compact"
  );
  assert.ok(
    AFENDA_TENANT_BRANDING_IMPLEMENTED_CUSTOMIZATION_KEYS.includes("density")
  );
  assert.throws(() =>
    afendaTenantBrandingSettingsSchema.parse({
      themePreset: "afenda",
      auditPolicy: "tenant-controlled",
    })
  );
  for (const key of AFENDA_TENANT_BRANDING_ALLOWED_CUSTOMIZATION_KEYS) {
    assert.ok(
      AFENDA_ALLOWED_CUSTOMIZATION_KEYS.includes(key),
      `tenant branding key "${key}" must be a subset of parent allowed customization keys`
    );
  }
  assert.deepEqual(
    [
      ...AFENDA_TENANT_BRANDING_IMPLEMENTED_CUSTOMIZATION_KEYS,
      ...AFENDA_TENANT_BRANDING_DEFERRED_CUSTOMIZATION_KEYS,
    ]
      .slice()
      .sort(),
    [...AFENDA_TENANT_BRANDING_ALLOWED_CUSTOMIZATION_KEYS].slice().sort()
  );
  assert.deepEqual(
    AFENDA_TENANT_BRANDING_IMPLEMENTED_CUSTOMIZATION_KEYS.filter((key) =>
      (AFENDA_TENANT_BRANDING_DEFERRED_CUSTOMIZATION_KEYS as readonly string[]).includes(
        key
      )
    ),
    []
  );
});

test("afenda user branding contract governs optional preference overlay only", () => {
  validateAfendaUserBrandingContract();

  assert.equal(afendaUserBrandingContract.id, AFENDA_USER_BRANDING_CONTRACT_ID);
  assert.equal(
    afendaUserBrandingContract.parentContractId,
    AFENDA_TENANT_BRANDING_CONTRACT_ID
  );
  assert.deepEqual(afendaUserBrandingContract.emptyPreferences, {});
  assert.ok(
    AFENDA_USER_BRANDING_GOVERNANCE_REFERENCES.includes(
      "AFENDA:tenant-branding-contract"
    )
  );
  assert.deepEqual(
    afendaUserBrandingPreferencesSchema.parse({
      colorMode: "system",
      themePreset: "vercel-geist",
    }),
    {
      colorMode: "system",
      themePreset: "vercel-geist",
    }
  );
  assert.throws(() =>
    afendaUserBrandingPreferencesSchema.parse({
      themePreset: "teal",
    })
  );
  assert.throws(() =>
    afendaUserBrandingPreferencesSchema.parse({
      colorMode: "system",
      executionPipeline: "user-controlled",
    })
  );
});

test("afenda color token registry owns color vocabulary", () => {
  validateAfendaColorTokenRegistry();

  assert.equal(afendaColorTokenRegistry.id, AFENDA_COLOR_TOKEN_REGISTRY_ID);
  assert.ok(AFENDA_BASE_COLOR_TOKENS.includes("background"));
  assert.ok(AFENDA_BRAND_COLOR_TOKENS.includes("primary"));
  assert.ok(AFENDA_STATUS_COLOR_TOKENS.includes("destructive"));
  assert.equal(
    AFENDA_SEMANTIC_COLOR_TOKENS.length,
    AFENDA_BASE_COLOR_TOKENS.length + AFENDA_BRAND_COLOR_TOKENS.length
  );
  assert.ok(AFENDA_COLOR_TOKEN_GOVERNANCE_REFERENCES.includes("APCA"));
  assert.ok(
    AFENDA_COLOR_TOKEN_GOVERNANCE_REFERENCES.includes("WCAG:1.4.3")
  );
});

test("afenda chart registry owns chart token and hue vocabulary", () => {
  validateAfendaChartRegistry();

  assert.equal(afendaChartRegistry.id, AFENDA_CHART_REGISTRY_ID);
  assert.deepEqual(AFENDA_CHART_COLOR_TOKENS, [
    "chart-1",
    "chart-2",
    "chart-3",
    "chart-4",
    "chart-5",
    "chart-6",
    "chart-7",
  ]);
  assert.equal(AFENDA_CHART_HUES["chart-1"], 198);
  assert.equal(Object.keys(AFENDA_CHART_HUES).length, AFENDA_CHART_COLOR_TOKENS.length);
  assert.ok(
    AFENDA_CHART_GOVERNANCE_REFERENCES.includes("AFENDA:data-display-contract")
  );
  assert.ok(AFENDA_CHART_GOVERNANCE_REFERENCES.includes("WCAG:1.4.1"));
});

test("afenda chart usage contract governs chart palette scenarios", () => {
  validateAfendaChartUsageContract();

  assert.equal(afendaChartUsageContract.id, AFENDA_CHART_USAGE_CONTRACT_ID);
  assert.equal(
    AFENDA_COLOR_USAGE_RATIO.neutral +
      AFENDA_COLOR_USAGE_RATIO.lane +
      AFENDA_COLOR_USAGE_RATIO.status,
    100
  );
  assert.ok(
    AFENDA_CHART_USAGE_SCENARIOS.some(
      (scenario) =>
        scenario.id === "category-breakdown" &&
        scenario.palette.includes("chart-7")
    )
  );
  assert.ok(
    AFENDA_CHART_USAGE_SCENARIOS.some(
      (scenario) =>
        scenario.id === "risk-exception-data" &&
        scenario.palette.includes("destructive")
    )
  );
  assert.ok(
    AFENDA_CHART_USAGE_GOVERNANCE_REFERENCES.includes(
      "AFENDA:data-display-contract"
    )
  );
  assert.ok(
    AFENDA_CHART_USAGE_GOVERNANCE_REFERENCES.includes(
      "AFENDA:hue-reservation-contract"
    )
  );
});

test("afenda visual lane registry owns ERP visual lane vocabulary only", () => {
  validateAfendaVisualLaneRegistry();

  assert.equal(afendaVisualLaneRegistry.id, AFENDA_VISUAL_LANE_REGISTRY_ID);
  assert.equal(AFENDA_ERP_VISUAL_LANE_IDS.length, 7);
  assert.ok(AFENDA_ERP_VISUAL_LANE_IDS.includes("governance"));
  assert.ok(AFENDA_LANE_COLOR_SCALE_FIELDS.includes("glow"));
  assert.deepEqual(
    AFENDA_ERP_VISUAL_LANES.map((lane) => lane.id),
    AFENDA_ERP_VISUAL_LANE_IDS
  );
  assert.ok(
    AFENDA_VISUAL_LANE_GOVERNANCE_REFERENCES.includes(
      "AFENDA:tenant-context-contract"
    )
  );
  assert.ok(
    AFENDA_VISUAL_LANE_GOVERNANCE_REFERENCES.includes(
      "AFENDA:hue-reservation-contract"
    )
  );
});

test("afenda module lane catalog maps features to visual lanes only", () => {
  validateAfendaModuleLaneCatalog();

  assert.equal(afendaModuleLaneCatalog.id, AFENDA_MODULE_LANE_CATALOG_ID);
  assert.equal(AFENDA_ERP_MODULE_LANE_DEFAULT_LANE, "governance");
  assert.equal(AFENDA_ERP_MODULE_LANE_DEFAULTS["master-data.customers"], "customer");
  assert.equal(
    getAfendaDefaultLaneForFeature("master-data.products"),
    "goods"
  );
  assert.equal(
    getAfendaDefaultLaneForFeature("hr-suite.payroll-compensation.periods"),
    "money"
  );
  assert.equal(
    getAfendaDefaultLaneForFeature("hr-suite.benefits.enrollment"),
    "people"
  );
  assert.equal(
    getAfendaDefaultLaneForFeature("unknown-module.surface"),
    "governance"
  );
  assert.ok(
    AFENDA_MODULE_LANE_PREFIX_RULES[0] !== undefined &&
      AFENDA_MODULE_LANE_PREFIX_RULES.at(-1) !== undefined &&
      AFENDA_MODULE_LANE_PREFIX_RULES[0].prefix.length >=
        AFENDA_MODULE_LANE_PREFIX_RULES.at(-1)!.prefix.length
  );
  assert.ok(
    AFENDA_ERP_CATALOG_MODULE_ENTRIES.some(
      (entry) =>
        entry.featureId === "system-admin.overview" &&
        entry.defaultLane === "intelligence"
    )
  );
  assert.ok(
    AFENDA_MODULE_LANE_GOVERNANCE_REFERENCES.includes(
      "AFENDA:visual-lane-registry"
    )
  );
  assert.ok(
    AFENDA_MODULE_LANE_GOVERNANCE_REFERENCES.includes(
      "AFENDA:tenant-context-contract"
    )
  );
});

test("afenda hue reservation contract governs visual semantic separation", () => {
  validateAfendaHueReservationContract();

  assert.equal(
    afendaHueReservationContract.id,
    AFENDA_HUE_RESERVATION_CONTRACT_ID
  );
  assert.equal(
    afendaHueReservationContract.id,
    AFENDA_HUE_RESERVATION_POLICY_ID
  );
  assert.equal(AFENDA_COLOR_HUE_SYSTEM.status.destructive, 27);
  assert.equal(AFENDA_COLOR_HUE_SYSTEM.lanes.money, 160);
  assert.equal(AFENDA_MIN_HUE_SEPARATION.brandVsStatus, 10);
  assert.ok(
    AFENDA_HUE_RESERVATION_GOVERNANCE_REFERENCES.includes(
      "AFENDA:theming-contract"
    )
  );
  assert.ok(
    AFENDA_HUE_RESERVATION_GOVERNANCE_REFERENCES.includes(
      "AFENDA:visual-design-contract"
    )
  );

  const validResult = validateAfendaHueReservation(
    collectAfendaReservedStatusHueEntries()
  );
  assert.equal(validResult.valid, true);

  const invalidResult = validateAfendaHueReservation([
    { family: "brand-primary", category: "brand", hue: 140 },
    { family: "status-success", category: "status", hue: 145 },
  ]);
  assert.equal(invalidResult.valid, false);
  assert.equal(invalidResult.collisions[0]?.rule, "brand-vs-status");
});

test("afenda font registry owns font preset vocabulary", () => {
  validateAfendaFontRegistry();

  assert.equal(afendaFontRegistry.id, AFENDA_FONT_REGISTRY_ID);
  assert.deepEqual(
    AFENDA_FONT_PRESETS.map((preset) => preset.name),
    AFENDA_FONT_PRESET_NAMES
  );
  assert.ok(AFENDA_FONT_ROLES.includes("heading"));
  assert.ok(
    AFENDA_FONT_PRESETS.some(
      (preset) =>
        preset.name === "geist" &&
        preset.provider === "fontsource" &&
        preset.packageName === "@fontsource-variable/geist"
    )
  );
  assert.ok(
    AFENDA_FONT_GOVERNANCE_REFERENCES.includes("AFENDA:typography-contract")
  );
  assert.ok(AFENDA_FONT_GOVERNANCE_REFERENCES.includes("WCAG:1.4.12"));
});

test("afenda density registry owns density token vocabulary", () => {
  validateAfendaDensityRegistry();

  assert.equal(afendaDensityRegistry.id, AFENDA_DENSITY_REGISTRY_ID);
  assert.deepEqual(AFENDA_DENSITY_TOKEN_NAMES, [
    "density-control-height",
    "density-table-row-height",
  ]);
  assert.deepEqual(
    AFENDA_DENSITY_TOKEN_BINDINGS.map((binding) => binding.mode),
    AFENDA_DENSITY_MODES
  );
  assert.ok(
    AFENDA_DENSITY_GOVERNANCE_REFERENCES.includes("AFENDA:touch-layout-contract")
  );
  assert.ok(AFENDA_DENSITY_GOVERNANCE_REFERENCES.includes("WCAG:1.4.12"));
});

test("afenda component size registry owns size vocabulary", () => {
  validateAfendaComponentSizeRegistry();

  assert.equal(
    afendaComponentSizeRegistry.id,
    AFENDA_COMPONENT_SIZE_REGISTRY_ID
  );
  assert.deepEqual(AFENDA_COMPONENT_SIZES, ["xs", "sm", "md", "lg", "xl"]);
  assert.ok(AFENDA_CONTROL_SIZES.includes("icon"));
  assert.deepEqual(AFENDA_TABLE_SIZES, AFENDA_DENSITY_MODES);
  assert.ok(
    AFENDA_COMPONENT_SIZE_GOVERNANCE_REFERENCES.includes(
      "AFENDA:density-registry"
    )
  );
  assert.ok(
    AFENDA_COMPONENT_SIZE_GOVERNANCE_REFERENCES.includes(
      "AFENDA:touch-layout-contract"
    )
  );
});

test("afenda component variant registry owns approved variant vocabulary", () => {
  validateAfendaComponentVariantRegistry();

  assert.equal(
    afendaComponentVariantRegistry.id,
    AFENDA_COMPONENT_VARIANT_REGISTRY_ID
  );
  assert.ok(AFENDA_BUTTON_VARIANTS.includes("destructive"));
  assert.ok(AFENDA_BADGE_VARIANTS.includes("lane"));
  assert.ok(AFENDA_FIELD_VARIANTS.includes("invalid"));
  assert.ok(AFENDA_FORM_VARIANT_STATES.includes("forbidden"));
  assert.ok(AFENDA_TABLE_STATES.includes("forbidden"));
  assert.ok(AFENDA_TABLE_VARIANTS.includes("dense"));
  assert.ok(
    AFENDA_COMPONENT_VARIANT_GOVERNANCE_REFERENCES.includes(
      "AFENDA:variant-promotion-contract"
    )
  );
  assert.ok(
    AFENDA_COMPONENT_VARIANT_GOVERNANCE_REFERENCES.includes(
      "AFENDA:component-size-registry"
    )
  );
});

test("afenda status tone registry owns status tone vocabulary", () => {
  validateAfendaStatusToneRegistry();

  assert.equal(afendaStatusToneRegistry.id, AFENDA_STATUS_TONE_REGISTRY_ID);
  assert.deepEqual(AFENDA_STATUS_TONES, [
    "neutral",
    "success",
    "warning",
    "destructive",
    "info",
  ]);
  assert.ok(AFENDA_STATUS_INTENTS.includes("outline"));
  assert.ok(
    AFENDA_STATUS_TONE_GOVERNANCE_REFERENCES.includes(
      "AFENDA:component-variant-registry"
    )
  );
  assert.ok(AFENDA_STATUS_TONE_GOVERNANCE_REFERENCES.includes("WCAG:1.4.1"));
});

test("afenda radius registry owns radius token vocabulary", () => {
  validateAfendaRadiusRegistry();

  assert.equal(afendaRadiusRegistry.id, AFENDA_RADIUS_REGISTRY_ID);
  assert.deepEqual(AFENDA_RADIUS_SOURCE_TOKENS, ["radius"]);
  assert.ok(AFENDA_RADIUS_TOKENS.includes("control"));
  assert.ok(AFENDA_RADIUS_TOKENS.includes("panel"));
  assert.ok(
    AFENDA_RADIUS_GOVERNANCE_REFERENCES.includes("AFENDA:layout-contract")
  );
  assert.ok(
    AFENDA_RADIUS_GOVERNANCE_REFERENCES.includes(
      "AFENDA:component-variant-contract"
    )
  );
});

test("afenda runtime reference exposes guideline rules for agent governance", () => {
  validateAfendaRuntimeReferenceContract();

  assert.equal(afendaRuntimeReferenceContract.id, AFENDA_RUNTIME_REFERENCE_ID);
  assert.ok(AFENDA_RUNTIME_RULES.length >= 20);
  assert.equal(
    getAfendaRuntimeRule("accessibility.icon-button-label").severity,
    "error"
  );
  assert.equal(getAfendaRuntimeRule("route-state.url-state").category, "route-state");
});

test("afenda rule registry aggregates built rule files without redefining rules", () => {
  validateAfendaRuleRegistry();

  assert.equal(AFENDA_RULE_GROUPS.length, 28);
  assert.equal(AFENDA_RULE_REGISTRY.length, AFENDA_RUNTIME_RULES.length);
  assert.equal(
    getAfendaRuleRegistryRule("accessibility.icon-button-label"),
    getAfendaRuntimeRule("accessibility.icon-button-label")
  );
  assert.deepEqual(
    AFENDA_RULE_REGISTRY.map((rule) => rule.id).sort(),
    AFENDA_RUNTIME_RULES.map((rule) => rule.id).sort()
  );
});

test("afenda runtime categories stay aligned with registered rule groups", () => {
  const runtimeCategories = [...AFENDA_RUNTIME_RULE_CATEGORIES].sort();
  const registryGroupCategories = AFENDA_RULE_GROUPS.map(
    (group) => group.category
  ).sort();
  const ruleCategories = [
    ...new Set(AFENDA_RUNTIME_RULES.map((rule) => rule.category)),
  ].sort();

  assert.deepEqual(registryGroupCategories, runtimeCategories);
  assert.deepEqual(ruleCategories, runtimeCategories);
});

test("afenda accessibility rules are extracted and complete", () => {
  const expectedRuleIds = [
    "accessibility.icon-button-label",
    "accessibility.form-control-label",
    "accessibility.keyboard-operable",
    "accessibility.semantic-action-navigation",
    "accessibility.image-alt",
    "accessibility.text-contrast",
    "accessibility.decorative-icon-hidden",
    "accessibility.async-update-live-region",
    "accessibility.semantic-html-first",
    "accessibility.heading-hierarchy",
    "accessibility.skip-link-main",
    "accessibility.heading-anchor-offset",
  ];

  assert.deepEqual(
    AFENDA_ACCESSIBILITY_RULES.map((rule) => rule.id),
    expectedRuleIds
  );
  assert.ok(
    expectedRuleIds.every((ruleId) =>
      AFENDA_RUNTIME_RULES.some((rule) => rule.id === ruleId)
    )
  );
  assert.equal(
    getAfendaRuntimeRule("accessibility.decorative-icon-hidden").severity,
    "warning"
  );
  assert.equal(
    getAfendaRuntimeRule("accessibility.async-update-live-region").severity,
    "warning"
  );
  assert.match(
    getAfendaRuntimeRule("accessibility.keyboard-operable").remediation,
    /native interactive elements first/
  );
  assert.match(
    getAfendaRuntimeRule("accessibility.heading-hierarchy").requirement,
    /logical document hierarchy/
  );
  assert.ok(
    AFENDA_ACCESSIBILITY_RULES.every((rule) => rule.rationale.length > 0)
  );
  assert.ok(
    AFENDA_RUNTIME_RULES.every((rule) => rule.rationale.length > 0)
  );
  assert.ok(
    AFENDA_RUNTIME_RULES.every((rule) =>
      ["static", "manual", "hybrid"].includes(rule.enforcement)
    )
  );
  assert.deepEqual(
    getAfendaRuntimeRule("accessibility.icon-button-label").references,
    ["WCAG:4.1.2", "WCAG:2.4.6"]
  );
  assert.equal(
    getAfendaRuntimeRule("accessibility.icon-button-label").enforcement,
    "static"
  );
  assert.deepEqual(AFENDA_APCA_CONTRAST_TARGETS, {
    criticalText: 75,
    standardUiText: 60,
    largeDisplayText: 45,
  });
  assert.deepEqual(getAfendaRuntimeRule("accessibility.text-contrast").references, [
    "APCA",
    "WCAG:1.4.3",
    "WCAG:1.4.11",
  ]);
  assert.equal(
    getAfendaRuntimeRule("accessibility.text-contrast").enforcement,
    "static"
  );
});

test("afenda admin shell rules are extracted and complete", () => {
  const expectedRuleIds = [
    "admin-shell.elevated-context-visible",
    "admin-shell.impersonation-exit",
    "admin-shell.tenant-company-switching",
    "admin-shell.permission-aware-navigation",
    "admin-shell.danger-zone-containment",
    "admin-shell.audit-affordance",
    "admin-shell.reason-required-for-sensitive-actions",
    "admin-shell.break-glass-mode",
    "admin-shell.production-environment-clarity",
  ];

  assert.deepEqual(
    AFENDA_ADMIN_SHELL_RULES.map((rule) => rule.id),
    expectedRuleIds
  );
  assert.ok(
    expectedRuleIds.every((ruleId) =>
      AFENDA_RUNTIME_RULES.some((rule) => rule.id === ruleId)
    )
  );
  assert.equal(
    getAfendaRuntimeRule("admin-shell.elevated-context-visible").severity,
    "error"
  );
  assert.deepEqual(
    getAfendaRuntimeRule("admin-shell.impersonation-exit").references,
    ["AFENDA:admin-shell-contract", "XFORGE:audit-events"]
  );
  assert.deepEqual(
    getAfendaRuntimeRule("admin-shell.danger-zone-containment").references,
    ["AFENDA:admin-shell-contract", "AFENDA:mutation-contract", "WCAG:3.3.4"]
  );
  assert.equal(
    getAfendaRuntimeRule("admin-shell.reason-required-for-sensitive-actions").severity,
    "error"
  );
  assert.deepEqual(getAfendaRuntimeRule("admin-shell.break-glass-mode").references, [
    "AFENDA:admin-shell-contract",
    "AFENDA:audit-contract",
    "AFENDA:security-ui-contract",
  ]);
  assert.deepEqual(
    getAfendaRuntimeRule("admin-shell.production-environment-clarity").references,
    ["AFENDA:admin-shell-contract", "AFENDA:security-ui-contract"]
  );
  assert.ok(
    AFENDA_ADMIN_SHELL_RULES.every((rule) => rule.category === "admin-shell")
  );
  assert.ok(
    AFENDA_ADMIN_SHELL_RULES.every((rule) => rule.rationale.length > 0)
  );
});

test("afenda audit rules are extracted and complete", () => {
  const expectedRuleIds = [
    "audit.event-completeness",
    "audit.actor-context",
    "audit.tenant-company-scope",
    "audit.target-identity",
    "audit.reason-capture",
    "audit.correlation-id",
    "audit.sensitive-data-redaction",
    "audit.immutability",
    "audit.success-failure-result",
    "audit.post-commit-order",
  ];

  assert.deepEqual(AFENDA_AUDIT_RULES.map((rule) => rule.id), expectedRuleIds);
  assert.ok(
    expectedRuleIds.every((ruleId) =>
      AFENDA_RUNTIME_RULES.some((rule) => rule.id === ruleId)
    )
  );
  assert.equal(getAfendaRuntimeRule("audit.event-completeness").severity, "error");
  assert.match(
    getAfendaRuntimeRule("audit.event-completeness").requirement,
    /actor, action, target, tenant, company/
  );
  assert.deepEqual(getAfendaRuntimeRule("audit.actor-context").references, [
    "AFENDA:audit-contract",
    "XFORGE:audit-events",
    "XFORGE:permission-pipeline",
  ]);
  assert.deepEqual(getAfendaRuntimeRule("audit.sensitive-data-redaction").forbidden, [
    "secret in audit event",
    "password in audit metadata",
    "token in audit diff",
    "full credential in audit trail",
  ]);
  assert.deepEqual(getAfendaRuntimeRule("audit.immutability").forbidden, [
    "audit event update",
    "audit event delete",
    "mutable audit trail",
  ]);
  assert.match(
    getAfendaRuntimeRule("audit.success-failure-result").remediation,
    /partial_success/
  );
  assert.deepEqual(getAfendaRuntimeRule("audit.post-commit-order").references, [
    "AFENDA:audit-contract",
    "XFORGE:mutation-pipeline",
  ]);
  assert.ok(AFENDA_AUDIT_RULES.every((rule) => rule.category === "audit"));
  assert.ok(AFENDA_AUDIT_RULES.every((rule) => rule.rationale.length > 0));
});

test("afenda focus rules are extracted and complete", () => {
  const expectedRuleIds = [
    "focus.visible-focus",
    "focus.focus-appearance-minimum",
    "focus.logical-focus-order",
    "focus.no-outline-none-without-replacement",
    "focus.use-focus-visible",
    "focus.compound-control-focus-within",
    "focus.modal-focus-trap",
    "focus.restore-focus-after-dialog",
    "focus.skip-link-visible-on-focus",
    "focus.focus-not-obscured",
  ];

  assert.deepEqual(
    AFENDA_FOCUS_RULES.map((rule) => rule.id),
    expectedRuleIds
  );
  assert.ok(
    expectedRuleIds.every((ruleId) =>
      AFENDA_RUNTIME_RULES.some((rule) => rule.id === ruleId)
    )
  );
  assert.equal(getAfendaRuntimeRule("focus.visible-focus").severity, "error");
  assert.deepEqual(getAfendaRuntimeRule("focus.focus-appearance-minimum").references, [
    "WCAG:2.4.13",
    "WCAG:1.4.11",
  ]);
  assert.deepEqual(getAfendaRuntimeRule("focus.logical-focus-order").references, [
    "WCAG:2.4.3",
  ]);
  assert.equal(
    getAfendaRuntimeRule("focus.no-outline-none-without-replacement").enforcement,
    "static"
  );
  assert.equal(getAfendaRuntimeRule("focus.modal-focus-trap").severity, "error");
  assert.ok(
    getAfendaRuntimeRule("focus.modal-focus-trap").references?.includes(
      "WAI-ARIA-APG:dialog-modal"
    )
  );
  assert.deepEqual(getAfendaRuntimeRule("focus.skip-link-visible-on-focus").references, [
    "WCAG:2.4.1",
    "WCAG:2.4.7",
  ]);
  assert.ok(AFENDA_FOCUS_RULES.every((rule) => rule.rationale.length > 0));
});

test("afenda interaction rules are extracted and complete", () => {
  const expectedRuleIds = [
    "interaction.visible-states",
    "interaction.hover-feedback",
    "interaction.state-feedback",
    "interaction.not-hover-only",
    "interaction.hover-focus-content",
    "interaction.pointer-cancellation",
    "interaction.target-size-minimum",
    "interaction.drag-selection-control",
    "interaction.autofocus-restraint",
  ];

  assert.deepEqual(
    AFENDA_INTERACTION_RULES.map((rule) => rule.id),
    expectedRuleIds
  );
  assert.ok(
    expectedRuleIds.every((ruleId) =>
      AFENDA_RUNTIME_RULES.some((rule) => rule.id === ruleId)
    )
  );
  assert.equal(getAfendaRuntimeRule("interaction.not-hover-only").severity, "error");
  assert.deepEqual(getAfendaRuntimeRule("interaction.not-hover-only").references, [
    "WCAG:1.4.13",
    "WCAG:2.1.1",
  ]);
  assert.deepEqual(getAfendaRuntimeRule("interaction.hover-focus-content").references, [
    "WCAG:1.4.13",
  ]);
  assert.deepEqual(getAfendaRuntimeRule("interaction.pointer-cancellation").references, [
    "WCAG:2.5.2",
  ]);
  assert.deepEqual(getAfendaRuntimeRule("interaction.target-size-minimum").references, [
    "WCAG:2.5.8",
  ]);
  assert.equal(getAfendaRuntimeRule("interaction.state-feedback").severity, "warning");
  assert.equal(
    getAfendaRuntimeRule("interaction.autofocus-restraint").enforcement,
    "hybrid"
  );
  assert.ok(AFENDA_INTERACTION_RULES.every((rule) => rule.rationale.length > 0));
});

test("afenda forms rules are extracted and complete", () => {
  const expectedRuleIds = [
    "forms.framework-contract",
    "forms.input-contract",
    "forms.paste-allowed",
    "forms.inline-errors",
    "forms.submit-pending-state",
    "forms.error-summary-focus",
    "forms.help-text-association",
    "forms.error-message-association",
    "forms.required-indicator",
    "forms.disabled-readonly-semantics",
    "forms.destructive-submit-confirmation",
    "forms.server-validation-finality",
  ];

  assert.deepEqual(AFENDA_FORMS_RULES.map((rule) => rule.id), expectedRuleIds);
  assert.ok(
    expectedRuleIds.every((ruleId) =>
      AFENDA_RUNTIME_RULES.some((rule) => rule.id === ruleId)
    )
  );
  assert.equal(getAfendaRuntimeRule("forms.paste-allowed").severity, "error");
  assert.deepEqual(getAfendaRuntimeRule("forms.framework-contract").references, [
    "AFENDA:form-adapter",
    "AFENDA:form-field-contract",
    "AFENDA:form-state-contract",
    "AFENDA:form-validation-contract",
    "WCAG:1.3.1",
    "WCAG:3.3.1",
    "WCAG:3.3.2",
    "WCAG:4.1.3",
  ]);
  assert.equal(
    getAfendaRuntimeRule("forms.framework-contract").enforcement,
    "hybrid"
  );
  assert.deepEqual(getAfendaRuntimeRule("forms.paste-allowed").forbidden, [
    "onPaste preventDefault",
  ]);
  assert.deepEqual(getAfendaRuntimeRule("forms.paste-allowed").references, [
    "WCAG:3.3.8",
    "WCAG:3.3.7",
  ]);
  assert.equal(
    getAfendaRuntimeRule("forms.submit-pending-state").enforcement,
    "hybrid"
  );
  assert.deepEqual(getAfendaRuntimeRule("forms.error-summary-focus").references, [
    "WCAG:3.3.1",
    "WCAG:3.3.3",
    "WCAG:2.4.3",
  ]);
  assert.deepEqual(getAfendaRuntimeRule("forms.help-text-association").references, [
    "WCAG:1.3.1",
    "WCAG:3.3.2",
  ]);
  assert.deepEqual(
    getAfendaRuntimeRule("forms.error-message-association").references,
    ["WCAG:3.3.1", "WCAG:4.1.3"]
  );
  assert.deepEqual(
    getAfendaRuntimeRule("forms.destructive-submit-confirmation").references,
    ["WCAG:3.3.4", "XFORGE:mutation-pipeline"]
  );
  assert.equal(
    getAfendaRuntimeRule("forms.server-validation-finality").severity,
    "error"
  );
  assert.ok(AFENDA_FORMS_RULES.every((rule) => rule.rationale.length > 0));
});

test("afenda route state rules are extracted and complete", () => {
  const expectedRuleIds = [
    "route-state.url-state",
    "route-state.filter-state",
    "route-state.pagination-state",
    "route-state.sort-state",
    "route-state.tab-state",
    "route-state.search-query-state",
    "route-state.back-forward-preserves-state",
    "route-state.refresh-recovers-state",
    "route-state.unsaved-changes-guard",
  ];

  assert.deepEqual(
    AFENDA_ROUTE_STATE_RULES.map((rule) => rule.id),
    expectedRuleIds
  );
  assert.ok(
    expectedRuleIds.every((ruleId) =>
      AFENDA_RUNTIME_RULES.some((rule) => rule.id === ruleId)
    )
  );
  assert.equal(
    getAfendaRuntimeRule("route-state.unsaved-changes-guard").severity,
    "error"
  );
  assert.deepEqual(
    getAfendaRuntimeRule("route-state.unsaved-changes-guard").references,
    ["WCAG:3.3.4"]
  );
  assert.equal(
    getAfendaRuntimeRule("route-state.sort-state").enforcement,
    "manual"
  );
  assert.ok(
    AFENDA_ROUTE_STATE_RULES.every((rule) => rule.category === "route-state")
  );
  assert.ok(
    AFENDA_ROUTE_STATE_RULES.every((rule) => !rule.id.startsWith("navigation."))
  );
  assert.ok(
    !AFENDA_RUNTIME_RULES.some(
      (rule) => rule.id === "navigation.destructive-confirmation"
    )
  );
  assert.ok(
    AFENDA_ROUTE_STATE_RULES.every((rule) => rule.rationale.length > 0)
  );
});

test("afenda navigation rules are extracted and complete", () => {
  const expectedRuleIds = [
    "navigation.real-links-for-navigation",
    "navigation.current-location-indicator",
    "navigation.skip-link-target",
    "navigation.landmark-structure",
    "navigation.unique-nav-labels",
    "navigation.breadcrumb-semantics",
    "navigation.menu-semantics",
  ];

  assert.deepEqual(
    AFENDA_NAVIGATION_RULES.map((rule) => rule.id),
    expectedRuleIds
  );
  assert.ok(
    expectedRuleIds.every((ruleId) =>
      AFENDA_RUNTIME_RULES.some((rule) => rule.id === ruleId)
    )
  );
  assert.equal(
    getAfendaRuntimeRule("navigation.real-links-for-navigation").severity,
    "error"
  );
  assert.deepEqual(
    getAfendaRuntimeRule("navigation.real-links-for-navigation").forbidden,
    ["button navigation", "div navigation", "onClick push without link"]
  );
  assert.deepEqual(
    getAfendaRuntimeRule("navigation.current-location-indicator").references,
    ["AFENDA:navigation-contract", "WCAG:2.4.8", "WCAG:1.3.1"]
  );
  assert.equal(
    getAfendaRuntimeRule("navigation.current-location-indicator").severity,
    "error"
  );
  assert.deepEqual(getAfendaRuntimeRule("navigation.skip-link-target").references, [
    "AFENDA:navigation-contract",
    "WCAG:2.4.1",
  ]);
  assert.equal(
    getAfendaRuntimeRule("navigation.landmark-structure").severity,
    "error"
  );
  assert.match(
    getAfendaRuntimeRule("navigation.unique-nav-labels").remediation,
    /Primary navigation/
  );
  assert.ok(
    getAfendaRuntimeRule("navigation.menu-semantics").references?.includes(
      "WAI-ARIA-APG:menu-button"
    )
  );
  assert.ok(
    AFENDA_NAVIGATION_RULES.every((rule) => rule.category === "navigation")
  );
  assert.ok(
    AFENDA_NAVIGATION_RULES.every((rule) => !rule.id.startsWith("route-state."))
  );
  assert.ok(
    AFENDA_NAVIGATION_RULES.every((rule) => rule.rationale.length > 0)
  );
});

test("afenda semantics rules are extracted and complete", () => {
  const expectedRuleIds = [
    "semantics.native-before-aria",
    "semantics.button-link-correctness",
    "semantics.heading-structure",
    "semantics.accessible-name",
    "semantics.list-structure",
    "semantics.table-structure",
    "semantics.status-semantics",
    "semantics.disclosure-semantics",
    "semantics.valid-aria",
    "semantics.presentation-role-safety",
  ];

  assert.deepEqual(
    AFENDA_SEMANTICS_RULES.map((rule) => rule.id),
    expectedRuleIds
  );
  assert.ok(
    expectedRuleIds.every((ruleId) =>
      AFENDA_RUNTIME_RULES.some((rule) => rule.id === ruleId)
    )
  );
  assert.equal(
    getAfendaRuntimeRule("semantics.button-link-correctness").severity,
    "error"
  );
  assert.deepEqual(
    getAfendaRuntimeRule("semantics.button-link-correctness").forbidden,
    ["button with href behavior", "link used for mutation", "div[onClick]", "span[onClick]"]
  );
  assert.equal(
    getAfendaRuntimeRule("semantics.valid-aria").enforcement,
    "static"
  );
  assert.match(
    getAfendaRuntimeRule("semantics.heading-structure").requirement,
    /independent of visual size/
  );
  assert.deepEqual(getAfendaRuntimeRule("semantics.accessible-name").references, [
    "AFENDA:semantics-contract",
    "WCAG:4.1.2",
    "WCAG:2.5.3",
  ]);
  assert.match(
    getAfendaRuntimeRule("semantics.accessible-name").remediation,
    /aria-labelledby only when the component pattern requires it/
  );
  assert.ok(
    getAfendaRuntimeRule("semantics.table-structure").references?.includes(
      "WAI-ARIA-APG:grid"
    )
  );
  assert.ok(
    getAfendaRuntimeRule("semantics.disclosure-semantics").references?.includes(
      "WAI-ARIA-APG:disclosure"
    )
  );
  assert.deepEqual(
    getAfendaRuntimeRule("semantics.presentation-role-safety").forbidden,
    [
      "role=presentation on meaningful content",
      "role=none on meaningful content",
      "role=presentation on focusable element",
      "role=none on focusable element",
      "role=\"presentation\" on meaningful content",
      "role=\"none\" on meaningful content",
    ]
  );
  assert.ok(
    AFENDA_SEMANTICS_RULES.every((rule) => rule.category === "semantics")
  );
  assert.ok(
    AFENDA_SEMANTICS_RULES.every((rule) => rule.rationale.length > 0)
  );
});

test("afenda layout rules are extracted and complete", () => {
  const expectedRuleIds = [
    "layout.responsive-reflow",
    "layout.overflow-containment",
    "layout.min-width-zero",
    "layout.sticky-chrome-offset",
    "layout.scroll-container-contract",
    "layout.content-clipping-safety",
    "layout.empty-state-ownership",
    "layout.safe-area-aware",
    "layout.stable-dimensions",
    "layout.density-breakpoints",
  ];

  assert.deepEqual(AFENDA_LAYOUT_RULES.map((rule) => rule.id), expectedRuleIds);
  assert.ok(
    expectedRuleIds.every((ruleId) =>
      AFENDA_RUNTIME_RULES.some((rule) => rule.id === ruleId)
    )
  );
  assert.equal(getAfendaRuntimeRule("layout.responsive-reflow").severity, "error");
  assert.deepEqual(getAfendaRuntimeRule("layout.responsive-reflow").references, [
    "AFENDA:layout-contract",
    "WCAG:1.4.10",
  ]);
  assert.deepEqual(getAfendaRuntimeRule("layout.min-width-zero").forbidden, [
    "flex child with long text and no min-w-0",
    "grid child with long text and no min-w-0",
  ]);
  assert.ok(
    getAfendaRuntimeRule("layout.sticky-chrome-offset").references?.includes(
      "WCAG:2.4.11"
    )
  );
  assert.equal(
    getAfendaRuntimeRule("layout.sticky-chrome-offset").severity,
    "error"
  );
  assert.deepEqual(getAfendaRuntimeRule("layout.scroll-container-contract").references, [
    "AFENDA:layout-contract",
    "WCAG:2.1.1",
    "WCAG:2.4.7",
    "WCAG:2.4.11",
  ]);
  assert.deepEqual(getAfendaRuntimeRule("layout.content-clipping-safety").forbidden, [
    "overflow-hidden without title/tooltip/full-value access",
  ]);
  assert.deepEqual(getAfendaRuntimeRule("layout.empty-state-ownership").references, [
    "AFENDA:layout-contract",
    "AFENDA:empty-state-contract",
  ]);
  assert.deepEqual(getAfendaRuntimeRule("layout.stable-dimensions").references, [
    "AFENDA:layout-contract",
    "CoreWebVitals:CLS",
  ]);
  assert.ok(AFENDA_LAYOUT_RULES.every((rule) => rule.category === "layout"));
  assert.ok(AFENDA_LAYOUT_RULES.every((rule) => rule.rationale.length > 0));
});

test("afenda content rules are extracted and complete", () => {
  const expectedRuleIds = [
    "content.long-text",
    "content.empty-state",
    "content.actionable-errors",
    "content.loading-status-copy",
    "content.control-label-specificity",
    "content.destructive-action-copy",
    "content.localization-safe-text",
    "content.sensitive-data-redaction",
    "content.regional-formatting",
    "content.status-copy-consistency",
  ];

  assert.deepEqual(AFENDA_CONTENT_RULES.map((rule) => rule.id), expectedRuleIds);
  assert.ok(
    expectedRuleIds.every((ruleId) =>
      AFENDA_RUNTIME_RULES.some((rule) => rule.id === ruleId)
    )
  );
  assert.equal(getAfendaRuntimeRule("content.long-text").severity, "error");
  assert.deepEqual(getAfendaRuntimeRule("content.empty-state").references, [
    "AFENDA:content-contract",
    "AFENDA:empty-state-contract",
  ]);
  assert.deepEqual(getAfendaRuntimeRule("content.loading-status-copy").forbidden, [
    "generic loading copy for long-running or ambiguous operations",
  ]);
  assert.deepEqual(getAfendaRuntimeRule("content.control-label-specificity").references, [
    "AFENDA:content-contract",
    "WCAG:2.4.4",
    "WCAG:2.5.3",
  ]);
  assert.deepEqual(getAfendaRuntimeRule("content.destructive-action-copy").references, [
    "AFENDA:content-contract",
    "WCAG:3.3.4",
    "XFORGE:mutation-pipeline",
  ]);
  assert.deepEqual(getAfendaRuntimeRule("content.sensitive-data-redaction").forbidden, [
    "secret value in UI",
    "token in error",
    "password in message",
    "full credential display",
  ]);
  assert.deepEqual(getAfendaRuntimeRule("content.regional-formatting").references, [
    "AFENDA:content-contract",
    "AFENDA:locale-contract",
  ]);
  assert.deepEqual(getAfendaRuntimeRule("content.status-copy-consistency").references, [
    "AFENDA:content-contract",
    "AFENDA:status-tone-contract",
  ]);
  assert.ok(AFENDA_CONTENT_RULES.every((rule) => rule.category === "content"));
  assert.ok(AFENDA_CONTENT_RULES.every((rule) => rule.rationale.length > 0));
});

test("afenda data display rules are extracted and complete", () => {
  const expectedRuleIds = [
    "data-display.table-state-coverage",
    "data-display.column-meaning",
    "data-display.numeric-alignment",
    "data-display.status-badge-contract",
    "data-display.row-action-safety",
    "data-display.sort-filter-indicators",
    "data-display.truncation-recovery",
    "data-display.selection-state",
    "data-display.data-freshness",
    "data-display.permission-aware-values",
    "data-display.responsive-column-behavior",
  ];

  assert.deepEqual(
    AFENDA_DATA_DISPLAY_RULES.map((rule) => rule.id),
    expectedRuleIds
  );
  assert.ok(
    expectedRuleIds.every((ruleId) =>
      AFENDA_RUNTIME_RULES.some((rule) => rule.id === ruleId)
    )
  );
  assert.equal(
    getAfendaRuntimeRule("data-display.table-state-coverage").severity,
    "error"
  );
  assert.match(
    getAfendaRuntimeRule("data-display.table-state-coverage").requirement,
    /filtered-empty/
  );
  assert.deepEqual(getAfendaRuntimeRule("data-display.column-meaning").references, [
    "AFENDA:data-display-contract",
    "WCAG:1.3.1",
  ]);
  assert.deepEqual(getAfendaRuntimeRule("data-display.status-badge-contract").references, [
    "AFENDA:data-display-contract",
    "AFENDA:status-tone-contract",
  ]);
  assert.deepEqual(getAfendaRuntimeRule("data-display.truncation-recovery").forbidden, [
    "truncated identifier without full value access",
    "clipped amount",
    "clipped status label",
  ]);
  assert.deepEqual(getAfendaRuntimeRule("data-display.selection-state").references, [
    "AFENDA:data-display-contract",
    "WCAG:4.1.2",
  ]);
  assert.deepEqual(getAfendaRuntimeRule("data-display.data-freshness").references, [
    "AFENDA:data-display-contract",
    "AFENDA:observability-contract",
  ]);
  assert.deepEqual(
    getAfendaRuntimeRule("data-display.permission-aware-values").references,
    [
      "AFENDA:data-display-contract",
      "AFENDA:security-ui-contract",
      "XFORGE:permission-pipeline",
    ]
  );
  assert.ok(
    AFENDA_DATA_DISPLAY_RULES.every((rule) => rule.category === "data-display")
  );
  assert.ok(
    AFENDA_DATA_DISPLAY_RULES.every((rule) => rule.rationale.length > 0)
  );
});

test("afenda feedback rules are extracted and complete", () => {
  const expectedRuleIds = [
    "feedback.async-operation-state",
    "feedback.inline-error-proximity",
    "feedback.error-summary-focus",
    "feedback.toast-lifecycle",
    "feedback.no-critical-toast-only",
    "feedback.live-region-priority",
    "feedback.no-feedback-only-color",
    "feedback.success-confirmation-scope",
    "feedback.optimistic-update-reconciliation",
    "feedback.recovery-affordance",
  ];

  assert.deepEqual(
    AFENDA_FEEDBACK_RULES.map((rule) => rule.id),
    expectedRuleIds
  );
  assert.ok(
    expectedRuleIds.every((ruleId) =>
      AFENDA_RUNTIME_RULES.some((rule) => rule.id === ruleId)
    )
  );
  assert.equal(getAfendaRuntimeRule("feedback.async-operation-state").severity, "error");
  assert.deepEqual(getAfendaRuntimeRule("feedback.inline-error-proximity").references, [
    "AFENDA:feedback-contract",
    "WCAG:3.3.1",
    "WCAG:3.3.3",
  ]);
  assert.deepEqual(getAfendaRuntimeRule("feedback.error-summary-focus").references, [
    "AFENDA:feedback-contract",
    "WCAG:2.4.3",
    "WCAG:3.3.1",
  ]);
  assert.deepEqual(getAfendaRuntimeRule("feedback.live-region-priority").references, [
    "AFENDA:feedback-contract",
    "WCAG:4.1.3",
  ]);
  assert.deepEqual(getAfendaRuntimeRule("feedback.toast-lifecycle").references, [
    "AFENDA:feedback-contract",
    "WCAG:2.2.1",
    "WCAG:2.2.2",
  ]);
  assert.deepEqual(getAfendaRuntimeRule("feedback.no-critical-toast-only").references, [
    "AFENDA:feedback-contract",
    "WCAG:3.3.1",
    "WCAG:3.3.3",
  ]);
  assert.deepEqual(getAfendaRuntimeRule("feedback.no-feedback-only-color").references, [
    "AFENDA:feedback-contract",
    "WCAG:1.4.1",
  ]);
  assert.deepEqual(
    getAfendaRuntimeRule("feedback.optimistic-update-reconciliation").references,
    ["AFENDA:feedback-contract", "XFORGE:mutation-pipeline"]
  );
  assert.ok(AFENDA_FEEDBACK_RULES.every((rule) => rule.category === "feedback"));
  assert.ok(AFENDA_FEEDBACK_RULES.every((rule) => rule.rationale.length > 0));
});

test("afenda visual design rules are extracted and complete", () => {
  const expectedRuleIds = [
    "visual-design.hierarchy",
    "visual-design.tokenized-color",
    "visual-design.brand-consistency",
    "visual-design.contrast-pairing",
    "visual-design.status-treatment",
    "visual-design.elevation-purpose",
    "visual-design.component-consistency",
    "visual-design.spacing-rhythm",
    "visual-design.density-balance",
    "visual-design.icon-consistency",
    "visual-design.non-generic-composition",
  ];

  assert.deepEqual(
    AFENDA_VISUAL_DESIGN_RULES.map((rule) => rule.id),
    expectedRuleIds
  );
  assert.ok(
    expectedRuleIds.every((ruleId) =>
      AFENDA_RUNTIME_RULES.some((rule) => rule.id === ruleId)
    )
  );
  assert.equal(
    getAfendaRuntimeRule("visual-design.hierarchy").severity,
    "error"
  );
  assert.deepEqual(getAfendaRuntimeRule("visual-design.tokenized-color").forbidden, [
    "hard-coded hex color",
    "hard-coded rgb color",
    "hard-coded hsl color",
    "arbitrary brand color",
  ]);
  assert.deepEqual(getAfendaRuntimeRule("visual-design.status-treatment").references, [
    "AFENDA:visual-design-contract",
    "AFENDA:status-tone-contract",
    "WCAG:1.4.1",
  ]);
  assert.deepEqual(getAfendaRuntimeRule("visual-design.brand-consistency").references, [
    "AFENDA:visual-design-contract",
    "AFENDA:brand-contract",
    "AFENDA:theme-token-contract",
  ]);
  assert.deepEqual(getAfendaRuntimeRule("visual-design.contrast-pairing").references, [
    "AFENDA:visual-design-contract",
    "AFENDA:theme-token-contract",
    "APCA",
    "WCAG:1.4.3",
  ]);
  assert.deepEqual(getAfendaRuntimeRule("visual-design.component-consistency").references, [
    "AFENDA:visual-design-contract",
    "AFENDA:component-variant-contract",
  ]);
  assert.deepEqual(getAfendaRuntimeRule("visual-design.non-generic-composition").forbidden, [
    "generic centered card layout for major surfaces",
    "ungoverned decorative gradient",
    "interchangeable template composition",
  ]);
  assert.ok(
    getAfendaRuntimeRule("visual-design.non-generic-composition").references?.includes(
      "WEB-DESIGN-GUIDELINES:creative-direction"
    )
  );
  assert.ok(
    AFENDA_VISUAL_DESIGN_RULES.every((rule) => rule.category === "visual-design")
  );
  assert.ok(
    AFENDA_VISUAL_DESIGN_RULES.every((rule) => rule.rationale.length > 0)
  );
});

test("afenda motion rules are extracted and complete", () => {
  const expectedRuleIds = [
    "motion.reduced-motion",
    "motion.no-autoplaying-nonessential-motion",
    "motion.no-motion-only-meaning",
    "motion.purposeful-motion",
    "motion.duration-bounds",
    "motion.no-layout-animation",
    "motion.entrance-exit-consistency",
    "motion.loading-feedback",
    "motion.scroll-behavior",
    "motion.state-feedback",
  ];

  assert.deepEqual(AFENDA_MOTION_RULES.map((rule) => rule.id), expectedRuleIds);
  assert.ok(
    expectedRuleIds.every((ruleId) =>
      AFENDA_RUNTIME_RULES.some((rule) => rule.id === ruleId)
    )
  );
  assert.equal(getAfendaRuntimeRule("motion.reduced-motion").severity, "error");
  assert.deepEqual(getAfendaRuntimeRule("motion.reduced-motion").forbidden, [
    "transition: all",
    "animation without reduced-motion fallback",
  ]);
  assert.deepEqual(getAfendaRuntimeRule("motion.reduced-motion").references, [
    "AFENDA:motion-contract",
    "WCAG:2.3.3",
    "WCAG:2.2.2",
  ]);
  assert.deepEqual(
    getAfendaRuntimeRule("motion.no-autoplaying-nonessential-motion").references,
    ["AFENDA:motion-contract", "WCAG:2.2.2", "WCAG:2.3.3"]
  );
  assert.deepEqual(getAfendaRuntimeRule("motion.no-motion-only-meaning").references, [
    "AFENDA:motion-contract",
    "WCAG:1.4.1",
    "WCAG:2.3.3",
  ]);
  assert.equal(
    getAfendaRuntimeRule("motion.no-layout-animation").enforcement,
    "static"
  );
  assert.deepEqual(getAfendaRuntimeRule("motion.no-layout-animation").forbidden, [
    "animating width",
    "animating height",
    "animating top",
    "animating left",
    "animating margin",
  ]);
  assert.deepEqual(getAfendaRuntimeRule("motion.scroll-behavior").references, [
    "AFENDA:motion-contract",
    "WCAG:2.3.3",
    "WCAG:2.4.1",
  ]);
  assert.ok(
    !AFENDA_RUNTIME_RULES.some((rule) => rule.id === "animation.reduced-motion")
  );
  assert.ok(AFENDA_MOTION_RULES.every((rule) => rule.category === "motion"));
  assert.ok(AFENDA_MOTION_RULES.every((rule) => rule.rationale.length > 0));
});

test("afenda performance rules are extracted and complete", () => {
  const expectedRuleIds = [
    "performance.large-list",
    "performance.no-layout-read-render",
    "performance.stable-layout",
    "performance.interaction-responsiveness",
    "performance.image-media-loading",
    "performance.bundle-boundary",
    "performance.server-first-data-volume",
    "performance.async-state-feedback",
    "performance.scoped-pending-state",
    "performance.client-boundary-restraint",
    "performance.no-unbounded-render-work",
  ];

  assert.deepEqual(
    AFENDA_PERFORMANCE_RULES.map((rule) => rule.id),
    expectedRuleIds
  );
  assert.ok(
    expectedRuleIds.every((ruleId) =>
      AFENDA_RUNTIME_RULES.some((rule) => rule.id === ruleId)
    )
  );
  assert.equal(getAfendaRuntimeRule("performance.large-list").severity, "error");
  assert.match(
    getAfendaRuntimeRule("performance.large-list").requirement,
    /governed thresholds/
  );
  assert.deepEqual(AFENDA_PERFORMANCE_THRESHOLDS, {
    renderedCollectionItems: 50,
    visibleTableRows: 100,
    dashboardCards: 24,
  });
  assert.deepEqual(getAfendaRuntimeRule("performance.no-layout-read-render").forbidden, [
    "getBoundingClientRect in render",
    "offsetHeight in render",
    "offsetWidth in render",
    "scrollTop in render",
  ]);
  assert.deepEqual(getAfendaRuntimeRule("performance.stable-layout").references, [
    "AFENDA:performance-contract",
    "CoreWebVitals:CLS",
  ]);
  assert.deepEqual(
    getAfendaRuntimeRule("performance.interaction-responsiveness").references,
    ["AFENDA:performance-contract", "CoreWebVitals:INP"]
  );
  assert.deepEqual(getAfendaRuntimeRule("performance.image-media-loading").references, [
    "AFENDA:performance-contract",
    "CoreWebVitals:LCP",
    "CoreWebVitals:CLS",
  ]);
  assert.deepEqual(getAfendaRuntimeRule("performance.server-first-data-volume").forbidden, [
    "client-side filtering over full enterprise dataset",
    "client-side sorting over full enterprise dataset",
    "shipping full dataset to browser for dashboard aggregation",
  ]);
  assert.deepEqual(getAfendaRuntimeRule("performance.server-first-data-volume").references, [
    "AFENDA:performance-contract",
    "AFENDA:data-access-contract",
    "XFORGE:repository-boundary",
  ]);
  assert.deepEqual(getAfendaRuntimeRule("performance.scoped-pending-state").forbidden, [
    "global page disabled for local mutation",
    "full page spinner for local update",
  ]);
  assert.deepEqual(getAfendaRuntimeRule("performance.client-boundary-restraint").references, [
    "AFENDA:performance-contract",
    "XFORGE:server-first-ui",
  ]);
  assert.ok(
    AFENDA_PERFORMANCE_RULES.every((rule) => rule.category === "performance")
  );
  assert.ok(
    AFENDA_PERFORMANCE_RULES.every((rule) => rule.rationale.length > 0)
  );
});

test("afenda mutation rules are extracted and complete", () => {
  const expectedRuleIds = [
    "mutation.pipeline-order",
    "mutation.server-validation-finality",
    "mutation.destructive-confirmation",
    "mutation.double-submit-protection",
    "mutation.idempotency-required",
    "mutation.audit-event-required",
    "mutation.post-commit-effects-only",
    "mutation.optimistic-reconciliation",
    "mutation.conflict-resolution",
    "mutation.preserve-input-on-error",
    "mutation.permission-fail-closed",
  ];

  assert.deepEqual(AFENDA_MUTATION_RULES.map((rule) => rule.id), expectedRuleIds);
  assert.ok(
    expectedRuleIds.every((ruleId) =>
      AFENDA_RUNTIME_RULES.some((rule) => rule.id === ruleId)
    )
  );
  assert.equal(getAfendaRuntimeRule("mutation.pipeline-order").severity, "error");
  assert.match(
    getAfendaRuntimeRule("mutation.pipeline-order").requirement,
    /authenticate, resolve tenant, verify membership/
  );
  assert.deepEqual(getAfendaRuntimeRule("mutation.destructive-confirmation").references, [
    "AFENDA:mutation-contract",
    "WCAG:3.3.4",
    "XFORGE:mutation-pipeline",
  ]);
  assert.deepEqual(getAfendaRuntimeRule("mutation.post-commit-effects-only").forbidden, [
    "side effect before mutation success",
    "audit before failed validation",
    "notification before commit",
  ]);
  assert.deepEqual(getAfendaRuntimeRule("mutation.audit-event-required").references, [
    "AFENDA:mutation-contract",
    "AFENDA:audit-contract",
    "XFORGE:audit-events",
  ]);
  assert.deepEqual(getAfendaRuntimeRule("mutation.idempotency-required").references, [
    "AFENDA:mutation-contract",
    "XFORGE:mutation-pipeline",
  ]);
  assert.deepEqual(getAfendaRuntimeRule("mutation.conflict-resolution").references, [
    "AFENDA:mutation-contract",
    "XFORGE:repository-boundary",
  ]);
  assert.deepEqual(getAfendaRuntimeRule("mutation.permission-fail-closed").references, [
    "AFENDA:mutation-contract",
    "XFORGE:permission-pipeline",
    "XFORGE:tenant-company-scope",
  ]);
  assert.ok(AFENDA_MUTATION_RULES.every((rule) => rule.category === "mutation"));
  assert.ok(AFENDA_MUTATION_RULES.every((rule) => rule.rationale.length > 0));
});

test("afenda observability rules are extracted and complete", () => {
  const expectedRuleIds = [
    "observability.structured-logs",
    "observability.diagnostic-event-naming",
    "observability.correlation-id-propagation",
    "observability.redaction",
    "observability.no-raw-payload-logging",
    "observability.error-boundaries",
    "observability.health-signals",
    "observability.no-console-production",
    "observability.trace-async-work",
    "observability.user-safe-error-id",
  ];

  assert.deepEqual(
    AFENDA_OBSERVABILITY_RULES.map((rule) => rule.id),
    expectedRuleIds
  );
  assert.ok(
    expectedRuleIds.every((ruleId) =>
      AFENDA_RUNTIME_RULES.some((rule) => rule.id === ruleId)
    )
  );
  assert.equal(getAfendaRuntimeRule("observability.structured-logs").severity, "error");
  assert.deepEqual(getAfendaRuntimeRule("observability.structured-logs").forbidden, [
    "unstructured string log",
    "console.log in production path",
  ]);
  assert.deepEqual(
    getAfendaRuntimeRule("observability.correlation-id-propagation").references,
    ["AFENDA:observability-contract", "AFENDA:audit-contract"]
  );
  assert.deepEqual(getAfendaRuntimeRule("observability.redaction").forbidden, [
    "secret in log",
    "token in trace",
    "password in error report",
    "PII in metric label",
  ]);
  assert.deepEqual(getAfendaRuntimeRule("observability.diagnostic-event-naming").references, [
    "AFENDA:observability-contract",
  ]);
  assert.deepEqual(getAfendaRuntimeRule("observability.no-raw-payload-logging").forbidden, [
    "raw request body in log",
    "raw form data in log",
    "raw webhook payload in log",
    "raw response body in log",
  ]);
  assert.deepEqual(getAfendaRuntimeRule("observability.no-raw-payload-logging").references, [
    "AFENDA:observability-contract",
    "AFENDA:security-contract",
  ]);
  assert.equal(
    getAfendaRuntimeRule("observability.no-console-production").severity,
    "error"
  );
  assert.deepEqual(getAfendaRuntimeRule("observability.no-console-production").forbidden, [
    "console.log",
    "console.debug",
    "console.error without logger",
  ]);
  assert.ok(
    AFENDA_OBSERVABILITY_RULES.every((rule) => rule.category === "observability")
  );
  assert.ok(
    AFENDA_OBSERVABILITY_RULES.every((rule) => rule.rationale.length > 0)
  );
});

test("afenda security UI rules are extracted and complete", () => {
  const expectedRuleIds = [
    "security-ui.secret-redaction",
    "security-ui.permission-aware-actions",
    "security-ui.no-client-only-authorization",
    "security-ui.destructive-action-safety",
    "security-ui.external-link-safety",
    "security-ui.impersonation-visibility",
    "security-ui.sensitive-field-reveal",
    "security-ui.audit-visible-sensitive-actions",
    "security-ui.tenant-context-clarity",
    "security-ui.untrusted-content-boundary",
  ];

  assert.deepEqual(
    AFENDA_SECURITY_UI_RULES.map((rule) => rule.id),
    expectedRuleIds
  );
  assert.ok(
    expectedRuleIds.every((ruleId) =>
      AFENDA_RUNTIME_RULES.some((rule) => rule.id === ruleId)
    )
  );
  assert.equal(getAfendaRuntimeRule("security-ui.secret-redaction").severity, "error");
  assert.deepEqual(getAfendaRuntimeRule("security-ui.secret-redaction").forbidden, [
    "secret value in UI",
    "token in error",
    "password in message",
    "full credential display",
  ]);
  assert.deepEqual(
    getAfendaRuntimeRule("security-ui.permission-aware-actions").references,
    ["AFENDA:security-ui-contract", "XFORGE:permission-pipeline"]
  );
  assert.deepEqual(
    getAfendaRuntimeRule("security-ui.no-client-only-authorization").forbidden,
    [
      "client-only permission check",
      "disabled UI as authorization boundary",
      "hidden button as authorization boundary",
    ]
  );
  assert.deepEqual(
    getAfendaRuntimeRule("security-ui.destructive-action-safety").references,
    ["AFENDA:security-ui-contract", "WCAG:3.3.4", "XFORGE:mutation-pipeline"]
  );
  assert.deepEqual(getAfendaRuntimeRule("security-ui.external-link-safety").references, [
    "AFENDA:security-ui-contract",
    "OWASP:Reverse-Tabnabbing",
    "OWASP:Unvalidated-Redirects",
  ]);
  assert.deepEqual(getAfendaRuntimeRule("security-ui.external-link-safety").forbidden, [
    "target=_blank without rel=noopener",
    "untrusted href without protocol validation",
  ]);
  assert.deepEqual(
    getAfendaRuntimeRule("security-ui.audit-visible-sensitive-actions").references,
    ["AFENDA:security-ui-contract", "AFENDA:audit-contract", "XFORGE:audit-events"]
  );
  assert.deepEqual(
    getAfendaRuntimeRule("security-ui.untrusted-content-boundary").references,
    ["AFENDA:security-ui-contract", "OWASP:XSS"]
  );
  assert.ok(
    AFENDA_SECURITY_UI_RULES.every((rule) => rule.category === "security-ui")
  );
  assert.ok(
    AFENDA_SECURITY_UI_RULES.every((rule) => rule.rationale.length > 0)
  );
});

test("afenda tenant context rules are extracted and complete", () => {
  const expectedRuleIds = [
    "tenant-context.active-scope-visible",
    "tenant-context.route-scope-consistency",
    "tenant-context.mutation-scope-confirmation",
    "tenant-context.switch-resets-sensitive-state",
    "tenant-context.no-cross-tenant-data-leakage",
    "tenant-context.cache-key-is-scoped",
    "tenant-context.permission-scope-alignment",
    "tenant-context.export-scope",
    "tenant-context.realtime-events-scoped",
    "tenant-context.background-job-scope",
    "tenant-context.audit-scope-captured",
    "tenant-context.impersonation-scope",
    "tenant-context.scope-aware-empty-states",
  ];

  assert.deepEqual(
    AFENDA_TENANT_CONTEXT_RULES.map((rule) => rule.id),
    expectedRuleIds
  );
  assert.ok(
    expectedRuleIds.every((ruleId) =>
      AFENDA_RUNTIME_RULES.some((rule) => rule.id === ruleId)
    )
  );
  assert.equal(
    getAfendaRuntimeRule("tenant-context.active-scope-visible").severity,
    "error"
  );
  assert.deepEqual(
    getAfendaRuntimeRule("tenant-context.no-cross-tenant-data-leakage").forbidden,
    [
      "mixed tenant data without scope boundary",
      "cross-tenant result leakage",
      "previous tenant cache visible",
    ]
  );
  assert.deepEqual(
    getAfendaRuntimeRule("tenant-context.route-scope-consistency").references,
    [
      "AFENDA:tenant-context-contract",
      "AFENDA:scoped-route-contract",
      "XFORGE:execution-context",
    ]
  );
  assert.deepEqual(getAfendaRuntimeRule("tenant-context.cache-key-is-scoped").references, [
    "AFENDA:tenant-context-contract",
    "AFENDA:scope-cache-contract",
    "AFENDA:security-ui-contract",
  ]);
  assert.deepEqual(getAfendaRuntimeRule("tenant-context.export-scope").references, [
    "AFENDA:tenant-context-contract",
    "AFENDA:scoped-export-contract",
    "AFENDA:data-display-contract",
    "XFORGE:permission-pipeline",
  ]);
  assert.deepEqual(
    getAfendaRuntimeRule("tenant-context.realtime-events-scoped").references,
    [
      "AFENDA:tenant-context-contract",
      "AFENDA:realtime-scope-contract",
      "AFENDA:security-ui-contract",
    ]
  );
  assert.deepEqual(
    getAfendaRuntimeRule("tenant-context.background-job-scope").references,
    [
      "AFENDA:tenant-context-contract",
      "AFENDA:background-job-scope-contract",
      "AFENDA:audit-contract",
    ]
  );
  assert.deepEqual(
    getAfendaRuntimeRule("tenant-context.audit-scope-captured").references,
    [
      "AFENDA:tenant-context-contract",
      "AFENDA:audit-contract",
      "XFORGE:execution-context",
    ]
  );
  assert.deepEqual(
    getAfendaRuntimeRule("tenant-context.impersonation-scope").references,
    ["AFENDA:tenant-context-contract", "AFENDA:admin-shell-contract", "AFENDA:audit-contract"]
  );
  assert.ok(
    AFENDA_TENANT_CONTEXT_RULES.every((rule) => rule.category === "scope-integrity")
  );
  assert.ok(
    AFENDA_TENANT_CONTEXT_RULES.every((rule) => rule.rationale.length > 0)
  );
});

test("afenda typography rules are extracted and complete", () => {
  const expectedRuleIds = [
    "typography.tokenized-type-scale",
    "typography.density-aware-scale",
    "typography.semantic-heading-order",
    "typography.copy-symbols",
    "typography.heading-balance",
    "typography.readable-measure",
    "typography.zoom-resilience",
    "typography.numeric-comparison",
    "typography.data-grid-truncation",
    "typography.localized-text-expansion",
    "typography.no-placeholder-as-label",
    "typography.status-text-not-color-only",
    "typography.no-text-as-image",
    "typography.font-loading-stability",
  ];

  assert.deepEqual(
    AFENDA_TYPOGRAPHY_RULES.map((rule) => rule.id),
    expectedRuleIds
  );
  assert.ok(
    expectedRuleIds.every((ruleId) =>
      AFENDA_RUNTIME_RULES.some((rule) => rule.id === ruleId)
    )
  );
  assert.deepEqual(getAfendaRuntimeRule("typography.copy-symbols").forbidden, [
    "...",
    "Loading...",
    "Saving...",
  ]);
  assert.equal(
    getAfendaRuntimeRule("typography.tokenized-type-scale").severity,
    "error"
  );
  assert.deepEqual(getAfendaRuntimeRule("typography.tokenized-type-scale").references, [
    "AFENDA:typography-contract",
    "AFENDA:type-scale-contract",
    "AFENDA:theme-token-contract",
  ]);
  assert.deepEqual(getAfendaRuntimeRule("typography.tokenized-type-scale").forbidden, [
    "hard-coded font-size",
    "arbitrary line-height",
    "one-off font-weight",
  ]);
  assert.deepEqual(getAfendaRuntimeRule("typography.density-aware-scale").references, [
    "AFENDA:typography-contract",
    "AFENDA:density-contract",
    "AFENDA:theme-token-contract",
  ]);
  assert.deepEqual(getAfendaRuntimeRule("typography.semantic-heading-order").references, [
    "AFENDA:typography-contract",
    "AFENDA:semantics-contract",
    "WCAG:1.3.1",
  ]);
  assert.deepEqual(getAfendaRuntimeRule("typography.zoom-resilience").references, [
    "AFENDA:typography-contract",
    "AFENDA:accessibility-contract",
    "WCAG:1.4.4",
    "WCAG:1.4.10",
  ]);
  assert.equal(
    getAfendaRuntimeRule("typography.numeric-comparison").enforcement,
    "hybrid"
  );
  assert.match(
    getAfendaRuntimeRule("typography.numeric-comparison").requirement,
    /consistent alignment/
  );
  assert.deepEqual(getAfendaRuntimeRule("typography.data-grid-truncation").references, [
    "AFENDA:typography-contract",
    "AFENDA:data-display-contract",
    "AFENDA:interaction-contract",
  ]);
  assert.deepEqual(getAfendaRuntimeRule("typography.no-placeholder-as-label").references, [
    "AFENDA:typography-contract",
    "AFENDA:forms-contract",
    "AFENDA:accessibility-contract",
    "WCAG:3.3.2",
  ]);
  assert.deepEqual(
    getAfendaRuntimeRule("typography.status-text-not-color-only").references,
    [
      "AFENDA:typography-contract",
      "AFENDA:accessibility-contract",
      "AFENDA:status-tone-contract",
      "WCAG:1.4.1",
    ]
  );
  assert.deepEqual(getAfendaRuntimeRule("typography.no-text-as-image").references, [
    "AFENDA:typography-contract",
    "WCAG:1.4.5",
  ]);
  assert.deepEqual(getAfendaRuntimeRule("typography.font-loading-stability").references, [
    "AFENDA:typography-contract",
    "AFENDA:performance-contract",
    "AFENDA:visual-stability-contract",
  ]);
  assert.ok(
    AFENDA_TYPOGRAPHY_RULES.every((rule) => rule.category === "typography")
  );
  assert.ok(AFENDA_TYPOGRAPHY_RULES.every((rule) => rule.rationale.length > 0));
});

test("afenda images rules are extracted and complete", () => {
  const expectedRuleIds = [
    "images.dimensions",
    "images.alt-contract",
    "images.decorative-hidden-from-assistive-tech",
    "images.no-text-only-raster",
    "images.responsive-source-selection",
    "images.loading-priority",
    "images.format-optimization",
    "images.secure-remote-sources",
    "images.user-upload-safety",
    "images.sensitive-image-redaction",
    "images.tenant-brand-boundary",
    "images.avatar-fallback",
    "images.critical-image-fallback",
    "images.animated-image-control",
    "images.asset-ownership",
  ];

  assert.deepEqual(AFENDA_IMAGES_RULES.map((rule) => rule.id), expectedRuleIds);
  assert.ok(
    expectedRuleIds.every((ruleId) =>
      AFENDA_RUNTIME_RULES.some((rule) => rule.id === ruleId)
    )
  );
  assert.deepEqual(getAfendaRuntimeRule("images.dimensions").references, [
    "AFENDA:image-contract",
    "CoreWebVitals:CLS",
  ]);
  assert.deepEqual(getAfendaRuntimeRule("images.alt-contract").references, [
    "AFENDA:image-contract",
    "WCAG:1.1.1",
  ]);
  assert.deepEqual(
    getAfendaRuntimeRule("images.decorative-hidden-from-assistive-tech").references,
    ["AFENDA:image-contract", "AFENDA:accessibility-contract", "WCAG:1.1.1"]
  );
  assert.equal(
    getAfendaRuntimeRule("images.loading-priority").enforcement,
    "hybrid"
  );
  assert.equal(
    getAfendaRuntimeRule("images.format-optimization").enforcement,
    "hybrid"
  );
  assert.deepEqual(getAfendaRuntimeRule("images.secure-remote-sources").forbidden, [
    "unvalidated remote image URL",
    "javascript image URL",
    "data URL from untrusted source",
  ]);
  assert.deepEqual(getAfendaRuntimeRule("images.user-upload-safety").references, [
    "AFENDA:image-contract",
    "AFENDA:security-ui-contract",
    "AFENDA:upload-contract",
    "AFENDA:privacy-contract",
  ]);
  assert.deepEqual(getAfendaRuntimeRule("images.sensitive-image-redaction").references, [
    "AFENDA:image-contract",
    "AFENDA:permission-contract",
    "AFENDA:audit-contract",
    "AFENDA:security-ui-contract",
  ]);
  assert.deepEqual(getAfendaRuntimeRule("images.tenant-brand-boundary").references, [
    "AFENDA:image-contract",
    "AFENDA:tenant-context-contract",
    "AFENDA:security-ui-contract",
    "AFENDA:theming-contract",
  ]);
  assert.equal(getAfendaRuntimeRule("images.avatar-fallback").enforcement, "hybrid");
  assert.deepEqual(getAfendaRuntimeRule("images.critical-image-fallback").references, [
    "AFENDA:image-contract",
    "AFENDA:feedback-contract",
    "AFENDA:data-display-contract",
  ]);
  assert.deepEqual(getAfendaRuntimeRule("images.animated-image-control").references, [
    "AFENDA:image-contract",
    "AFENDA:motion-contract",
    "AFENDA:accessibility-contract",
    "WCAG:2.2.2",
  ]);
  assert.deepEqual(getAfendaRuntimeRule("images.no-text-only-raster").references, [
    "AFENDA:image-contract",
    "AFENDA:typography-contract",
    "WCAG:1.4.5",
  ]);
  assert.equal(
    getAfendaRuntimeRule("images.no-text-only-raster").enforcement,
    "hybrid"
  );
  assert.deepEqual(getAfendaRuntimeRule("images.asset-ownership").references, [
    "AFENDA:image-contract",
    "AFENDA:asset-governance-contract",
    "AFENDA:design-system-contract",
  ]);
  assert.ok(AFENDA_IMAGES_RULES.every((rule) => rule.category === "images"));
  assert.ok(AFENDA_IMAGES_RULES.every((rule) => rule.rationale.length > 0));
});

test("afenda touch layout rules are extracted and complete", () => {
  const expectedRuleIds = [
    "touch-layout.no-zoom-disabled",
    "touch-layout.target-spacing",
    "touch-layout.density-touch-mode",
    "touch-layout.no-hover-dependent-controls",
    "touch-layout.gesture-alternative",
    "touch-layout.drag-scroll-conflict",
    "touch-layout.modal-containment",
    "touch-layout.safe-area-insets",
    "touch-layout.keyboard-overlap",
    "touch-layout.sticky-action-safe-zone",
    "touch-layout.mobile-data-grid-adaptation",
    "touch-layout.viewport-change-resilience",
    "touch-layout.scroll-restoration",
  ];

  assert.deepEqual(
    AFENDA_TOUCH_LAYOUT_RULES.map((rule) => rule.id),
    expectedRuleIds
  );
  assert.ok(
    expectedRuleIds.every((ruleId) =>
      AFENDA_RUNTIME_RULES.some((rule) => rule.id === ruleId)
    )
  );
  assert.deepEqual(
    getAfendaRuntimeRule("touch-layout.modal-containment").references,
    [
      "AFENDA:touch-layout-contract",
      "AFENDA:layout-contract",
      "WCAG:2.1.1",
      "WCAG:2.4.7",
    ]
  );
  assert.deepEqual(
    getAfendaRuntimeRule("touch-layout.keyboard-overlap").references,
    [
      "AFENDA:touch-layout-contract",
      "AFENDA:forms-contract",
      "WCAG:2.4.11",
      "WCAG:3.3.1",
    ]
  );
  assert.deepEqual(getAfendaRuntimeRule("touch-layout.no-zoom-disabled").forbidden, [
    "user-scalable=no",
    "maximum-scale=1",
    "maximum-scale=1.0",
  ]);
  assert.deepEqual(
    getAfendaRuntimeRule("touch-layout.target-spacing").references,
    [
      "AFENDA:touch-layout-contract",
      "AFENDA:interaction-contract",
      "WCAG:2.5.8",
    ]
  );
  assert.deepEqual(
    getAfendaRuntimeRule("touch-layout.density-touch-mode").references,
    [
      "AFENDA:touch-layout-contract",
      "AFENDA:density-contract",
      "AFENDA:interaction-contract",
    ]
  );
  assert.deepEqual(
    getAfendaRuntimeRule("touch-layout.gesture-alternative").references,
    [
      "AFENDA:touch-layout-contract",
      "AFENDA:interaction-contract",
      "AFENDA:accessibility-contract",
      "WCAG:2.5.1",
      "WCAG:2.5.7",
    ]
  );
  assert.equal(
    getAfendaRuntimeRule("touch-layout.drag-scroll-conflict").enforcement,
    "hybrid"
  );
  assert.deepEqual(
    getAfendaRuntimeRule("touch-layout.sticky-action-safe-zone").references,
    [
      "AFENDA:touch-layout-contract",
      "AFENDA:forms-contract",
      "AFENDA:layout-contract",
    ]
  );
  assert.deepEqual(
    getAfendaRuntimeRule("touch-layout.mobile-data-grid-adaptation").references,
    [
      "AFENDA:touch-layout-contract",
      "AFENDA:data-display-contract",
      "AFENDA:responsive-layout-contract",
    ]
  );
  assert.deepEqual(
    getAfendaRuntimeRule("touch-layout.scroll-restoration").references,
    [
      "AFENDA:touch-layout-contract",
      "AFENDA:route-state-contract",
      "AFENDA:data-display-contract",
    ]
  );
  assert.equal(
    getAfendaRuntimeRule("touch-layout.no-zoom-disabled").enforcement,
    "static"
  );
  assert.ok(
    AFENDA_TOUCH_LAYOUT_RULES.every((rule) => rule.category === "touch-layout")
  );
  assert.ok(
    AFENDA_TOUCH_LAYOUT_RULES.every((rule) => rule.rationale.length > 0)
  );
});

test("afenda theming rules are extracted and complete", () => {
  const expectedRuleIds = [
    "theming.token-source-of-truth",
    "theming.token-publication-contract",
    "theming.no-legacy-theme-preset",
    "theming.semantic-token-pairs",
    "theming.tenant-brand-boundary",
    "theming.tenant-theme-validation",
    "theming.module-lane-boundary",
    "theming.status-hue-reservation",
    "theming.dark-mode-parity",
    "theming.focus-token-parity",
    "theming.forced-colors-support",
    "theming.no-color-only-meaning",
    "theming.chart-token-governance",
    "theming.native-color-scheme",
    "theming.theme-switch-stability",
    "theming.print-export-parity",
  ];

  assert.deepEqual(AFENDA_THEMING_RULES.map((rule) => rule.id), expectedRuleIds);
  assert.ok(
    expectedRuleIds.every((ruleId) =>
      AFENDA_RUNTIME_RULES.some((rule) => rule.id === ruleId)
    )
  );
  assert.deepEqual(getAfendaRuntimeRule("theming.token-source-of-truth").forbidden, [
    "hard-coded theme color in component",
    "one-off hex color",
    "one-off rgb color",
    "one-off oklch color outside token contract",
  ]);
  assert.deepEqual(getAfendaRuntimeRule("theming.semantic-token-pairs").references, [
    "AFENDA:theming-contract",
    "AFENDA:theme-token-contract",
    "APCA",
    "WCAG:1.4.3",
    "WCAG:1.4.11",
  ]);
  assert.deepEqual(
    getAfendaRuntimeRule("theming.token-publication-contract").references,
    [
      "AFENDA:theming-contract",
      "AFENDA:theme-token-contract",
      "AFENDA:design-system-contract",
      "AFENDA:manifest-contract",
    ]
  );
  assert.equal(
    getAfendaRuntimeRule("theming.token-publication-contract").enforcement,
    "static"
  );
  assert.deepEqual(getAfendaRuntimeRule("theming.no-legacy-theme-preset").forbidden, [
    "themePreset: xforge",
    "themePreset: vercel",
    "themePreset: teal",
    "themePreset: indigo",
    "themePreset: emerald",
    "themePreset: amber",
    "themePreset: rose",
  ]);
  assert.equal(
    getAfendaRuntimeRule("theming.no-legacy-theme-preset").severity,
    "error"
  );
  assert.equal(
    getAfendaRuntimeRule("theming.no-legacy-theme-preset").enforcement,
    "static"
  );
  assert.deepEqual(getAfendaRuntimeRule("theming.theme-switch-stability").forbidden, [
    "theme flash on load",
    "hydration mismatch from theme",
    "unscoped theme mutation",
  ]);
  assert.deepEqual(getAfendaRuntimeRule("theming.tenant-brand-boundary").references, [
    "AFENDA:theming-contract",
    "AFENDA:tenant-context-contract",
    "AFENDA:brand-contract",
    "AFENDA:security-ui-contract",
  ]);
  assert.deepEqual(getAfendaRuntimeRule("theming.tenant-theme-validation").references, [
    "AFENDA:theming-contract",
    "AFENDA:theme-validation-contract",
    "AFENDA:tenant-context-contract",
    "AFENDA:security-ui-contract",
  ]);
  assert.deepEqual(getAfendaRuntimeRule("theming.module-lane-boundary").references, [
    "AFENDA:theming-contract",
    "AFENDA:navigation-contract",
    "AFENDA:visual-design-contract",
    "AFENDA:status-tone-contract",
  ]);
  assert.equal(
    getAfendaRuntimeRule("theming.status-hue-reservation").enforcement,
    "static"
  );
  assert.deepEqual(getAfendaRuntimeRule("theming.focus-token-parity").references, [
    "AFENDA:theming-contract",
    "AFENDA:focus-contract",
    "AFENDA:accessibility-contract",
    "WCAG:2.4.7",
    "WCAG:2.4.11",
  ]);
  assert.deepEqual(getAfendaRuntimeRule("theming.forced-colors-support").references, [
    "AFENDA:theming-contract",
    "AFENDA:accessibility-contract",
    "WCAG:1.4.11",
    "WCAG:2.4.7",
  ]);
  assert.equal(
    getAfendaRuntimeRule("theming.no-color-only-meaning").enforcement,
    "hybrid"
  );
  assert.deepEqual(getAfendaRuntimeRule("theming.chart-token-governance").references, [
    "AFENDA:theming-contract",
    "AFENDA:chart-token-contract",
    "AFENDA:data-display-contract",
    "AFENDA:accessibility-contract",
  ]);
  assert.equal(getAfendaRuntimeRule("theming.native-color-scheme").severity, "warning");
  assert.deepEqual(getAfendaRuntimeRule("theming.print-export-parity").references, [
    "AFENDA:theming-contract",
    "AFENDA:export-contract",
    "AFENDA:tenant-context-contract",
    "AFENDA:data-display-contract",
  ]);
  assert.ok(AFENDA_THEMING_RULES.every((rule) => rule.category === "theming"));
  assert.ok(AFENDA_THEMING_RULES.every((rule) => rule.rationale.length > 0));
});

test("afenda locale rules are extracted and complete", () => {
  const expectedRuleIds = [
    "locale.tenant-locale-policy",
    "locale.route-locale-consistency",
    "locale.translation-key-contract",
    "locale.pluralization-and-grammar",
    "locale.intl-formatting",
    "locale.input-parsing-explicitness",
    "locale.timezone-explicitness",
    "locale.currency-code-explicitness",
    "locale.unit-system-explicitness",
    "locale.locale-aware-sorting",
    "locale.rtl-directionality",
    "locale.legal-language-boundary",
    "locale.export-locale-parity",
    "locale.fallback-language-clarity",
    "locale.translation-observability",
  ];

  assert.deepEqual(AFENDA_LOCALE_RULES.map((rule) => rule.id), expectedRuleIds);
  assert.ok(
    expectedRuleIds.every((ruleId) =>
      AFENDA_RUNTIME_RULES.some((rule) => rule.id === ruleId)
    )
  );
  assert.deepEqual(getAfendaRuntimeRule("locale.intl-formatting").forbidden, [
    "hard-coded date format",
    "hard-coded currency format",
    "hard-coded decimal separator",
  ]);
  assert.equal(getAfendaRuntimeRule("locale.intl-formatting").enforcement, "static");
  assert.deepEqual(getAfendaRuntimeRule("locale.tenant-locale-policy").references, [
    "AFENDA:locale-contract",
    "AFENDA:tenant-context-contract",
    "AFENDA:execution-context-contract",
  ]);
  assert.deepEqual(getAfendaRuntimeRule("locale.route-locale-consistency").references, [
    "AFENDA:locale-contract",
    "AFENDA:navigation-contract",
    "AFENDA:route-state-contract",
  ]);
  assert.deepEqual(getAfendaRuntimeRule("locale.input-parsing-explicitness").forbidden, [
    "ambiguous localized input parsing",
    "viewer-locale-only financial parsing",
  ]);
  assert.deepEqual(getAfendaRuntimeRule("locale.timezone-explicitness").references, [
    "AFENDA:locale-contract",
    "AFENDA:audit-contract",
    "AFENDA:tenant-context-contract",
  ]);
  assert.deepEqual(getAfendaRuntimeRule("locale.currency-code-explicitness").references, [
    "AFENDA:locale-contract",
    "AFENDA:data-display-contract",
    "AFENDA:finance-contract",
  ]);
  assert.deepEqual(getAfendaRuntimeRule("locale.unit-system-explicitness").references, [
    "AFENDA:locale-contract",
    "AFENDA:data-display-contract",
    "AFENDA:inventory-contract",
    "AFENDA:manufacturing-contract",
  ]);
  assert.deepEqual(getAfendaRuntimeRule("locale.translation-key-contract").forbidden, [
    "inline user-facing string without translation key",
    "string concatenation for translated UI",
  ]);
  assert.deepEqual(getAfendaRuntimeRule("locale.pluralization-and-grammar").forbidden, [
    "count + hard-coded singular noun",
    "manual plural suffix",
    "English-only grammar assembly",
  ]);
  assert.deepEqual(getAfendaRuntimeRule("locale.rtl-directionality").references, [
    "AFENDA:locale-contract",
    "AFENDA:layout-contract",
    "AFENDA:navigation-contract",
    "WCAG:1.3.2",
  ]);
  assert.deepEqual(getAfendaRuntimeRule("locale.legal-language-boundary").references, [
    "AFENDA:locale-contract",
    "AFENDA:content-contract",
    "AFENDA:audit-contract",
    "AFENDA:compliance-contract",
  ]);
  assert.deepEqual(getAfendaRuntimeRule("locale.export-locale-parity").references, [
    "AFENDA:locale-contract",
    "AFENDA:export-contract",
    "AFENDA:data-display-contract",
  ]);
  assert.equal(
    getAfendaRuntimeRule("locale.fallback-language-clarity").enforcement,
    "hybrid"
  );
  assert.deepEqual(getAfendaRuntimeRule("locale.translation-observability").references, [
    "AFENDA:locale-contract",
    "AFENDA:message-catalog-contract",
    "AFENDA:observability-contract",
  ]);
  assert.ok(AFENDA_LOCALE_RULES.every((rule) => rule.category === "locale"));
  assert.ok(AFENDA_LOCALE_RULES.every((rule) => rule.rationale.length > 0));
});

test("afenda hydration rules are extracted and complete", () => {
  const expectedRuleIds = [
    "hydration.server-client-markup-parity",
    "hydration.browser-api-boundary",
    "hydration.client-boundary-minimal",
    "hydration.execution-context-parity",
    "hydration.auth-session-parity",
    "hydration.theme-initial-state",
    "hydration.locale-initial-state",
    "hydration.route-state-parity",
    "hydration.client-store-bootstrap",
    "hydration.input-value",
    "hydration.server-action-form-parity",
    "hydration.async-boundary-stability",
    "hydration.third-party-script-isolation",
    "hydration.suppress-warning-restraint",
    "hydration.recoverability-diagnostics",
  ];

  assert.deepEqual(
    AFENDA_HYDRATION_RULES.map((rule) => rule.id),
    expectedRuleIds
  );
  assert.ok(
    expectedRuleIds.every((ruleId) =>
      AFENDA_RUNTIME_RULES.some((rule) => rule.id === ruleId)
    )
  );
  assert.deepEqual(getAfendaRuntimeRule("hydration.input-value").forbidden, [
    "value without onChange",
    "controlled input without change handler",
  ]);
  assert.equal(getAfendaRuntimeRule("hydration.input-value").enforcement, "static");
  assert.deepEqual(
    getAfendaRuntimeRule("hydration.server-client-markup-parity").forbidden,
    [
      "Date.now in render",
      "Math.random in render",
      "browser-only value in server render",
      "non-deterministic id in render",
    ]
  );
  assert.deepEqual(getAfendaRuntimeRule("hydration.browser-api-boundary").forbidden, [
    "window in server render",
    "document in server render",
    "localStorage in server render",
    "matchMedia in server render",
  ]);
  assert.deepEqual(
    getAfendaRuntimeRule("hydration.execution-context-parity").references,
    [
      "AFENDA:hydration-contract",
      "AFENDA:execution-context-contract",
      "AFENDA:tenant-context-contract",
      "AFENDA:permission-contract",
    ]
  );
  assert.deepEqual(getAfendaRuntimeRule("hydration.auth-session-parity").references, [
    "AFENDA:hydration-contract",
    "AFENDA:security-ui-contract",
    "AFENDA:permission-contract",
    "AFENDA:auth-contract",
  ]);
  assert.deepEqual(getAfendaRuntimeRule("hydration.theme-initial-state").references, [
    "AFENDA:hydration-contract",
    "AFENDA:theming-contract",
    "AFENDA:tenant-context-contract",
  ]);
  assert.deepEqual(getAfendaRuntimeRule("hydration.locale-initial-state").references, [
    "AFENDA:hydration-contract",
    "AFENDA:locale-contract",
    "AFENDA:route-state-contract",
  ]);
  assert.deepEqual(getAfendaRuntimeRule("hydration.route-state-parity").references, [
    "AFENDA:hydration-contract",
    "AFENDA:route-state-contract",
    "AFENDA:data-display-contract",
  ]);
  assert.deepEqual(getAfendaRuntimeRule("hydration.client-store-bootstrap").references, [
    "AFENDA:hydration-contract",
    "AFENDA:route-state-contract",
    "AFENDA:tenant-context-contract",
  ]);
  assert.deepEqual(
    getAfendaRuntimeRule("hydration.server-action-form-parity").references,
    [
      "AFENDA:hydration-contract",
      "AFENDA:forms-contract",
      "AFENDA:mutation-contract",
      "AFENDA:validation-contract",
    ]
  );
  assert.equal(
    getAfendaRuntimeRule("hydration.async-boundary-stability").severity,
    "error"
  );
  assert.deepEqual(
    getAfendaRuntimeRule("hydration.third-party-script-isolation").references,
    [
      "AFENDA:hydration-contract",
      "AFENDA:security-ui-contract",
      "AFENDA:performance-contract",
    ]
  );
  assert.deepEqual(getAfendaRuntimeRule("hydration.suppress-warning-restraint").forbidden, [
    "unreviewed suppressHydrationWarning",
    "suppressHydrationWarning masking state drift",
  ]);
  assert.deepEqual(
    getAfendaRuntimeRule("hydration.recoverability-diagnostics").references,
    [
      "AFENDA:hydration-contract",
      "AFENDA:observability-contract",
      "AFENDA:runtime-diagnostics-contract",
    ]
  );
  assert.ok(AFENDA_HYDRATION_RULES.every((rule) => rule.category === "hydration"));
  assert.ok(AFENDA_HYDRATION_RULES.every((rule) => rule.rationale.length > 0));
});

test("afenda copy rules are extracted and complete", () => {
  const expectedRuleIds = [
    "copy.action-specific-label",
    "copy.scope-aware-action-copy",
    "copy.destructive-action-clarity",
    "copy.permission-denied-explanation",
    "copy.error-recovery",
    "copy.success-message-specificity",
    "copy.loading-operation-specific",
    "copy.empty-state-guidance",
    "copy.status-label-consistency",
    "copy.audit-evidence-copy",
    "copy.legal-and-financial-review",
    "copy.sensitive-data-minimization",
    "copy.ai-generated-copy-boundary",
    "copy.localization-safe-composition",
    "copy.no-blame-or-shame",
  ];

  assert.deepEqual(AFENDA_COPY_RULES.map((rule) => rule.id), expectedRuleIds);
  assert.ok(
    expectedRuleIds.every((ruleId) =>
      AFENDA_RUNTIME_RULES.some((rule) => rule.id === ruleId)
    )
  );
  assert.equal(getAfendaRuntimeRule("copy.action-specific-label").severity, "error");
  assert.deepEqual(getAfendaRuntimeRule("copy.action-specific-label").forbidden, [
    "Click here",
    "Submit",
    "OK",
    "Continue without context",
    "Cancel without context",
  ]);
  assert.deepEqual(getAfendaRuntimeRule("copy.error-recovery").references, [
    "AFENDA:copy-contract",
    "AFENDA:feedback-contract",
    "WCAG:3.3.1",
    "WCAG:3.3.3",
  ]);
  assert.deepEqual(getAfendaRuntimeRule("copy.scope-aware-action-copy").references, [
    "AFENDA:copy-contract",
    "AFENDA:tenant-context-contract",
    "AFENDA:mutation-contract",
  ]);
  assert.deepEqual(
    getAfendaRuntimeRule("copy.destructive-action-clarity").references,
    [
      "AFENDA:copy-contract",
      "AFENDA:mutation-contract",
      "AFENDA:tenant-context-contract",
      "WCAG:3.3.4",
    ]
  );
  assert.equal(
    getAfendaRuntimeRule("copy.destructive-action-clarity").enforcement,
    "hybrid"
  );
  assert.deepEqual(
    getAfendaRuntimeRule("copy.permission-denied-explanation").references,
    [
      "AFENDA:copy-contract",
      "AFENDA:security-ui-contract",
      "AFENDA:permission-contract",
    ]
  );
  assert.equal(
    getAfendaRuntimeRule("copy.permission-denied-explanation").enforcement,
    "hybrid"
  );
  assert.deepEqual(getAfendaRuntimeRule("copy.success-message-specificity").references, [
    "AFENDA:copy-contract",
    "AFENDA:feedback-contract",
    "AFENDA:mutation-contract",
  ]);
  assert.equal(getAfendaRuntimeRule("copy.empty-state-guidance").enforcement, "hybrid");
  assert.equal(getAfendaRuntimeRule("copy.status-label-consistency").enforcement, "hybrid");
  assert.deepEqual(getAfendaRuntimeRule("copy.audit-evidence-copy").references, [
    "AFENDA:copy-contract",
    "AFENDA:audit-contract",
    "AFENDA:observability-contract",
  ]);
  assert.deepEqual(getAfendaRuntimeRule("copy.legal-and-financial-review").references, [
    "AFENDA:copy-contract",
    "AFENDA:locale-contract",
    "AFENDA:compliance-contract",
    "AFENDA:audit-contract",
  ]);
  assert.deepEqual(getAfendaRuntimeRule("copy.sensitive-data-minimization").references, [
    "AFENDA:copy-contract",
    "AFENDA:privacy-contract",
    "AFENDA:security-ui-contract",
    "AFENDA:permission-contract",
  ]);
  assert.deepEqual(getAfendaRuntimeRule("copy.ai-generated-copy-boundary").references, [
    "AFENDA:copy-contract",
    "AFENDA:agent-governance-contract",
    "AFENDA:audit-contract",
    "AFENDA:decision-support-contract",
  ]);
  assert.deepEqual(getAfendaRuntimeRule("copy.localization-safe-composition").forbidden, [
    "string concatenation for translated UI",
    "English-only sentence assembly",
    "dynamic word-order assumption",
  ]);
  assert.deepEqual(getAfendaRuntimeRule("copy.no-blame-or-shame").forbidden, [
    "You failed",
    "Invalid because you",
    "Obviously",
    "Simply",
    "Just",
  ]);
  assert.equal(getAfendaRuntimeRule("copy.no-blame-or-shame").enforcement, "hybrid");
  assert.ok(AFENDA_COPY_RULES.every((rule) => rule.category === "copy"));
  assert.ok(AFENDA_COPY_RULES.every((rule) => rule.rationale.length > 0));
});

test("afenda anti-pattern rules are extracted and complete", () => {
  const expectedRuleIds = [
    "anti-pattern.mobile-zoom-disabled",
    "anti-pattern.div-button",
    "anti-pattern.link-for-mutation",
    "anti-pattern.raw-html-injection",
    "anti-pattern.client-only-authorization",
    "anti-pattern.unscoped-tenant-data",
    "anti-pattern.global-unscoped-client-store",
    "anti-pattern.unbounded-client-data",
    "anti-pattern.raw-sensitive-output",
    "anti-pattern.mutation-without-audit",
    "anti-pattern.optimistic-mutation-without-revalidation",
    "anti-pattern.silent-error-swallowing",
    "anti-pattern.layout-breaking-fixed-width",
    "anti-pattern.color-only-state",
    "anti-pattern.inline-style-token-bypass",
    "anti-pattern.unreviewed-escape-hatch",
  ];

  assert.deepEqual(
    AFENDA_ANTI_PATTERN_RULES.map((rule) => rule.id),
    expectedRuleIds
  );
  assert.ok(
    expectedRuleIds.every((ruleId) =>
      AFENDA_RUNTIME_RULES.some((rule) => rule.id === ruleId)
    )
  );
  assert.deepEqual(getAfendaRuntimeRule("anti-pattern.mobile-zoom-disabled").forbidden, [
    "user-scalable=no",
    "maximum-scale=1",
    "maximum-scale=1.0",
  ]);
  assert.equal(
    getAfendaRuntimeRule("anti-pattern.mobile-zoom-disabled").enforcement,
    "static"
  );
  assert.deepEqual(getAfendaRuntimeRule("anti-pattern.div-button").references, [
    "AFENDA:anti-pattern-contract",
    "AFENDA:semantics-contract",
    "WCAG:2.1.1",
    "WCAG:4.1.2",
  ]);
  assert.deepEqual(getAfendaRuntimeRule("anti-pattern.client-only-authorization").forbidden, [
    "client-only permission check",
    "disabled UI as authorization boundary",
    "hidden button as authorization boundary",
  ]);
  assert.deepEqual(getAfendaRuntimeRule("anti-pattern.raw-html-injection").references, [
    "AFENDA:anti-pattern-contract",
    "AFENDA:security-ui-contract",
    "OWASP:XSS",
  ]);
  assert.deepEqual(getAfendaRuntimeRule("anti-pattern.unscoped-tenant-data").references, [
    "AFENDA:anti-pattern-contract",
    "AFENDA:tenant-context-contract",
    "XFORGE:tenant-company-scope",
  ]);
  assert.deepEqual(
    getAfendaRuntimeRule("anti-pattern.global-unscoped-client-store").references,
    [
      "AFENDA:anti-pattern-contract",
      "AFENDA:tenant-context-contract",
      "AFENDA:route-state-contract",
      "AFENDA:hydration-contract",
    ]
  );
  assert.deepEqual(getAfendaRuntimeRule("anti-pattern.mutation-without-audit").references, [
    "AFENDA:anti-pattern-contract",
    "AFENDA:audit-contract",
    "AFENDA:mutation-contract",
    "AFENDA:execution-context-contract",
  ]);
  assert.deepEqual(
    getAfendaRuntimeRule("anti-pattern.optimistic-mutation-without-revalidation")
      .references,
    [
      "AFENDA:anti-pattern-contract",
      "AFENDA:mutation-contract",
      "AFENDA:permission-contract",
      "AFENDA:tenant-context-contract",
    ]
  );
  assert.deepEqual(getAfendaRuntimeRule("anti-pattern.silent-error-swallowing").forbidden, [
    "empty catch block",
    "catch without feedback or logging",
    "failed mutation hidden from user",
    "background job failure invisible",
  ]);
  assert.equal(
    getAfendaRuntimeRule("anti-pattern.layout-breaking-fixed-width").severity,
    "error"
  );
  assert.deepEqual(getAfendaRuntimeRule("anti-pattern.color-only-state").references, [
    "AFENDA:anti-pattern-contract",
    "AFENDA:accessibility-contract",
    "WCAG:1.4.1",
  ]);
  assert.deepEqual(
    getAfendaRuntimeRule("anti-pattern.inline-style-token-bypass").references,
    [
      "AFENDA:anti-pattern-contract",
      "AFENDA:design-system-contract",
      "AFENDA:theme-token-contract",
      "AFENDA:visual-design-contract",
    ]
  );
  assert.deepEqual(getAfendaRuntimeRule("anti-pattern.unreviewed-escape-hatch").forbidden, [
    "unexplained eslint-disable",
    "unexplained ts-ignore",
    "broad any escape",
    "broad hydration suppression",
    "unsafe escape hatch without owner",
  ]);
  assert.equal(
    getAfendaRuntimeRule("anti-pattern.unreviewed-escape-hatch").enforcement,
    "static"
  );
  assert.ok(
    AFENDA_ANTI_PATTERN_RULES.every((rule) => rule.category === "anti-pattern")
  );
  assert.ok(
    AFENDA_ANTI_PATTERN_RULES.every((rule) => rule.rationale.length > 0)
  );
});

test("afenda form framework contracts define portable adapter obligations", () => {
  assert.deepEqual(AFENDA_FORM_ENGINE_MODES, [
    "react-hook-form",
    "tanstack-form",
    "formisch",
    "next-server-action",
  ]);
  assert.ok(AFENDA_FORM_FRAMEWORK_REQUIREMENTS.includes("schema-source-of-truth"));
  assert.ok(AFENDA_FORM_FRAMEWORK_REQUIREMENTS.includes("typed-field-path"));
  assert.ok(
    AFENDA_FORM_FRAMEWORK_REQUIREMENTS.includes("label-description-error-binding")
  );
  assert.ok(AFENDA_FORM_FIELD_BINDINGS.includes("aria-describedby"));
  assert.ok(AFENDA_FORM_FIELD_BINDINGS.includes("aria-invalid"));
  assert.ok(AFENDA_FORM_STATES.includes("pending"));
  assert.ok(AFENDA_FORM_STATES.includes("readonly"));
  assert.ok(
    AFENDA_FORM_VALIDATION_REQUIREMENTS.includes(
      "submitted-values-preserved-on-error"
    )
  );
  assert.ok(
    AFENDA_FORM_VALIDATION_REQUIREMENTS.includes("server-validation-is-final")
  );
});

test("afenda rule evaluation contract defines runtime result authority", () => {
  assert.equal(
    afendaRuleEvaluationContract.id,
    AFENDA_RULE_EVALUATION_CONTRACT_ID
  );
  assert.deepEqual(AFENDA_RULE_EVALUATION_STATUSES, [
    "pass",
    "fail",
    "warning",
    "manual-review",
    "not-applicable",
    "not-evaluated",
  ]);
  assert.ok(AFENDA_RULE_EVALUATION_EVIDENCE_TYPES.includes("static-match"));
  assert.ok(AFENDA_RULE_EVALUATION_EVIDENCE_TYPES.includes("manual-note"));
  assert.ok(AFENDA_RULE_EVALUATION_EVIDENCE_TYPES.includes("contract-check"));
  assert.ok(AFENDA_RULE_EVALUATION_EVIDENCE_TYPES.includes("security-check"));
  assert.ok(AFENDA_RULE_EVALUATION_SUBJECT_TYPES.includes("component"));
  assert.ok(AFENDA_RULE_EVALUATION_SUBJECT_TYPES.includes("runtime-surface"));
  assert.ok(AFENDA_RULE_EVALUATION_SUBJECT_TYPES.includes("server-action"));
  assert.ok(AFENDA_RULE_EVALUATION_SUBJECT_TYPES.includes("client-boundary"));
  assert.ok(AFENDA_RULE_EVALUATION_ACTORS.includes("agent"));
  assert.ok(AFENDA_RULE_EVALUATION_ACTORS.includes("ci"));
  assert.ok(
    AFENDA_RULE_EVALUATION_GOVERNANCE_REFERENCES.includes(
      "AFENDA:violation-contract"
    )
  );
  assert.ok(afendaRuleEvaluationContract.categories.includes("accessibility"));
  assert.ok(afendaRuleEvaluationContract.enforcementModes.includes("hybrid"));

  const evaluatedAt = "2026-06-13T00:00:00.000Z";
  const evaluatedBy = {
    type: "static-check",
    name: "afenda-runtime-evaluator",
    version: "0.1.0",
  } as const;
  const result = {
    ruleId: "accessibility.icon-button-label",
    ruleVersion: "0.1.0",
    ruleSnapshotId: "afenda.runtime-reference@0.1.0",
    category: "accessibility",
    severity: "error",
    enforcement: "static",
    status: "fail",
    blocking: true,
    scope: {
      tenantId: "tenant_demo",
      companyId: "company_demo",
      packageName: "@repo/design-system",
      featureId: "afenda-contract",
    },
    subject: {
      id: "src/Button.tsx:42",
      type: "component",
      filePath: "src/Button.tsx",
      component: "Button",
      line: 42,
    },
    evidence: [
      {
        type: "static-match",
        description: "Icon-only button has no accessible name.",
        locator: "src/Button.tsx:42",
        expected: "aria-label or visible text",
        actual: "icon only",
        confidence: 0.98,
      },
    ],
    message: "Icon-only buttons must expose a useful aria-label.",
    remediation: "Add aria-label that names the action.",
    references: ["WCAG:4.1.2", "WCAG:2.4.6"],
    evaluatedBy,
    evaluatedAt,
    confidence: 0.98,
  } as const;

  validateAfendaRuleEvaluationResult(result);
  validateAfendaRuleEvaluationBatch({
    batchId: "batch_2026_06_13_afenda_rules",
    runId: "run_2026_06_13_0001",
    contractId: AFENDA_RULE_EVALUATION_CONTRACT_ID,
    contractVersion: afendaRuleEvaluationContract.version,
    sourceRuntimeReferenceId: "afenda.runtime-reference",
    scope: {
      packageName: "@repo/design-system",
      featureId: "afenda-contract",
    },
    evaluatedBy,
    evaluatedAt,
    results: [result],
    summary: {
      total: 1,
      pass: 0,
      fail: 1,
      warning: 0,
      manualReview: 0,
      notApplicable: 0,
      notEvaluated: 0,
      blocking: 1,
      averageConfidence: 0.98,
    },
  });
});

test("afenda violation contract normalizes failed evaluations", () => {
  assert.equal(afendaViolationContract.id, AFENDA_VIOLATION_CONTRACT_ID);
  assert.deepEqual(AFENDA_VIOLATION_STATUSES, [
    "open",
    "acknowledged",
    "in-progress",
    "resolved",
    "suppressed",
    "false-positive",
  ]);
  assert.deepEqual(AFENDA_VIOLATION_PRIORITIES, [
    "critical",
    "high",
    "medium",
    "low",
  ]);
  assert.deepEqual(AFENDA_VIOLATION_EVALUATION_STATUSES, [
    "fail",
    "warning",
    "manual-review",
  ]);
  assert.ok(
    AFENDA_VIOLATION_GOVERNANCE_REFERENCES.includes(
      "AFENDA:rule-evaluation-contract"
    )
  );
  assert.ok(
    AFENDA_VIOLATION_GOVERNANCE_REFERENCES.includes(
      "AFENDA:suppression-policy-contract"
    )
  );
  assert.equal(
    afendaViolationContract.sourceRuleEvaluationContractId,
    "afenda.rule-evaluation-contract"
  );

  const detectedAt = "2026-06-13T00:00:00.000Z";
  const detectedBy = {
    type: "static-check",
    name: "afenda-runtime-evaluator",
    version: "0.1.0",
  } as const;
  const violation = {
    violationId: "violation_accessibility_icon_button_label_001",
    fingerprint:
      "accessibility.icon-button-label|src/Button.tsx:42|tenant_demo|company_demo",
    evaluationBatchId: "batch_2026_06_13_afenda_rules",
    evaluationRunId: "run_2026_06_13_0001",
    evaluationResultId: "src/Button.tsx:42:accessibility.icon-button-label",
    evaluationStatus: "fail",
    ruleId: "accessibility.icon-button-label",
    ruleVersion: "0.1.0",
    ruleSnapshotId: "afenda.runtime-reference@0.1.0",
    category: "accessibility",
    severity: "error",
    priority: "critical",
    blocking: true,
    lifecycle: {
      status: "open",
      dueAt: "2026-06-20T00:00:00.000Z",
    },
    scope: {
      tenantId: "tenant_demo",
      companyId: "company_demo",
      packageName: "@repo/design-system",
      featureId: "afenda-contract",
    },
    location: {
      id: "src/Button.tsx:42",
      type: "component",
      filePath: "src/Button.tsx",
      component: "Button",
      line: 42,
    },
    message: "Icon-only buttons must expose a useful aria-label.",
    requirement: "Icon-only buttons must expose a useful aria-label.",
    remediation: "Add aria-label that names the action.",
    evidence: [
      {
        type: "static-match",
        description: "Icon-only button has no accessible name.",
        locator: "src/Button.tsx:42",
        expected: "aria-label or visible text",
        actual: "icon only",
        confidence: 0.98,
      },
    ],
    references: ["WCAG:4.1.2", "WCAG:2.4.6"],
    detectedBy,
    detectedAt,
    owner: {
      id: "agent_afenda_runtime",
      type: "agent",
      name: "Afenda Runtime Agent",
    },
    auditEventId: "audit_evt_001",
    correlationId: "corr_001",
  } as const;

  validateAfendaViolation(violation);
  validateAfendaViolationBatch({
    batchId: "violation_batch_2026_06_13_afenda_rules",
    evaluationBatchId: "batch_2026_06_13_afenda_rules",
    evaluationRunId: "run_2026_06_13_0001",
    contractId: AFENDA_VIOLATION_CONTRACT_ID,
    contractVersion: afendaViolationContract.version,
    scope: {
      packageName: "@repo/design-system",
      featureId: "afenda-contract",
    },
    generatedBy: detectedBy,
    generatedAt: detectedAt,
    violations: [violation],
    summary: {
      total: 1,
      open: 1,
      acknowledged: 0,
      inProgress: 0,
      resolved: 0,
      suppressed: 0,
      falsePositive: 0,
      blocking: 1,
      critical: 1,
      high: 0,
      medium: 0,
      low: 0,
    },
  });

  assert.throws(() =>
    validateAfendaViolation({
      ...violation,
      violationId: "violation_suppressed_without_reason",
      lifecycle: {
        status: "suppressed",
      },
    })
  );
  assert.throws(() =>
    validateAfendaViolation({
      ...violation,
      violationId: "violation_escalated_without_reason",
      lifecycle: {
        status: "open",
        escalatedAt: "2026-06-14T00:00:00.000Z",
      },
    })
  );
  assert.throws(() =>
    validateAfendaViolation({
      ...violation,
      violationId: "violation_blocking_suppressed_without_expiry",
      lifecycle: {
        status: "suppressed",
        suppressionReason: "Temporary release exception.",
        suppressionApprovedBy: "security_lead",
        suppressionAuditEventId: "audit_evt_suppression_001",
      },
    })
  );
  assert.throws(() =>
    validateAfendaViolation({
      ...violation,
      violationId: "violation_low_error_without_override",
      priority: "low",
    })
  );
  validateAfendaViolation({
    ...violation,
    violationId: "violation_low_error_with_override",
    priority: "low",
    priorityOverrideReason: "Static demo fixture is not production reachable.",
  });
});

test("afenda remediation contract defines governed repair plans", () => {
  assert.equal(afendaRemediationContract.id, AFENDA_REMEDIATION_CONTRACT_ID);
  assert.deepEqual(AFENDA_REMEDIATION_STATUSES, [
    "proposed",
    "approved",
    "in-progress",
    "applied",
    "verified",
    "rejected",
    "rolled-back",
  ]);
  assert.ok(AFENDA_REMEDIATION_ACTION_TYPES.includes("code-change"));
  assert.ok(AFENDA_REMEDIATION_ACTION_TYPES.includes("suppression-request"));
  assert.ok(AFENDA_REMEDIATION_RISK_LEVELS.includes("critical"));
  assert.ok(AFENDA_REMEDIATION_AUTOMATION_LEVELS.includes("agent-autofix"));
  assert.ok(AFENDA_REMEDIATION_REVIEW_GATES.includes("security-owner"));
  assert.ok(
    AFENDA_REMEDIATION_GOVERNANCE_REFERENCES.includes(
      "AFENDA:violation-contract"
    )
  );
  assert.equal(
    afendaRemediationContract.sourceViolationContractId,
    "afenda.violation-contract"
  );

  const createdAt = "2026-06-13T00:00:00.000Z";
  const createdBy = {
    type: "agent",
    name: "afenda-runtime-agent",
    version: "0.1.0",
  } as const;
  const plan = {
    remediationId: "remediation_accessibility_icon_button_label_001",
    violationId: "violation_accessibility_icon_button_label_001",
    violationFingerprint:
      "accessibility.icon-button-label|src/Button.tsx:42|tenant_demo|company_demo",
    evaluationBatchId: "batch_2026_06_13_afenda_rules",
    ruleId: "accessibility.icon-button-label",
    ruleSnapshotId: "afenda.runtime-reference@0.1.0",
    status: "proposed",
    risk: "low",
    automationLevel: "agent-autofix",
    reviewGate: "none",
    scope: {
      packageName: "@repo/design-system",
      featureId: "afenda-contract",
    },
    summary: "Add an accessible name to the icon-only button.",
    rationale:
      "Assistive technology users need a stable text alternative for icon-only controls.",
    actions: [
      {
        actionId: "action_add_aria_label",
        type: "code-change",
        description: "Add aria-label that names the button action.",
        target: {
          id: "src/Button.tsx:42",
          type: "component",
          filePath: "src/Button.tsx",
          component: "Button",
          line: 42,
        },
        before: "<button><Icon /></button>",
        after: '<button aria-label="Save API Key"><Icon /></button>',
      },
    ],
    verification: [
      {
        verificationId: "verify_design_system_tests",
        description: "Run design-system package tests.",
        commands: ["pnpm test"],
        expectedOutcome: "All design-system tests pass.",
        required: true,
      },
    ],
    rollback: {
      available: true,
      description: "Revert the button accessibility label patch.",
    },
    createdBy,
    createdAt,
    auditEventId: "audit_evt_remediation_001",
    correlationId: "corr_001",
  } as const;

  validateAfendaRemediationPlan(plan);
  validateAfendaRemediationBatch({
    batchId: "remediation_batch_2026_06_13_afenda_rules",
    violationBatchId: "violation_batch_2026_06_13_afenda_rules",
    evaluationBatchId: "batch_2026_06_13_afenda_rules",
    contractId: AFENDA_REMEDIATION_CONTRACT_ID,
    contractVersion: afendaRemediationContract.version,
    scope: {
      packageName: "@repo/design-system",
      featureId: "afenda-contract",
    },
    generatedBy: createdBy,
    generatedAt: createdAt,
    plans: [plan],
    summary: {
      total: 1,
      proposed: 1,
      approved: 0,
      inProgress: 0,
      applied: 0,
      verified: 0,
      rejected: 0,
      rolledBack: 0,
      blocking: 1,
    },
  });

  assert.throws(() =>
    validateAfendaRemediationPlan({
      ...plan,
      remediationId: "remediation_high_risk_without_gate",
      risk: "high",
      reviewGate: "none",
    })
  );
  assert.throws(() =>
    validateAfendaRemediationPlan({
      ...plan,
      remediationId: "remediation_verified_without_verified_at",
      status: "verified",
      approvedBy: "design_system_owner",
      appliedAt: "2026-06-13T01:00:00.000Z",
    })
  );
  assert.throws(() =>
    validateAfendaRemediationPlan({
      ...plan,
      remediationId: "remediation_rejected_without_reason",
      status: "rejected",
    })
  );
});

test("afenda agent governance contract controls runtime agent behavior", () => {
  validateAfendaAgentGovernanceContract();

  assert.equal(
    afendaAgentGovernanceContract.id,
    AFENDA_AGENT_GOVERNANCE_CONTRACT_ID
  );
  assert.ok(AFENDA_AGENT_GOVERNANCE_POLICY_TYPES.includes("required-action"));
  assert.ok(AFENDA_AGENT_GOVERNANCE_POLICY_TYPES.includes("forbidden-action"));
  assert.ok(AFENDA_AGENT_GOVERNANCE_TRIGGERS.includes("blocking-violation"));
  assert.ok(AFENDA_AGENT_GOVERNANCE_TRIGGERS.includes("suppression-request"));
  assert.ok(AFENDA_AGENT_GOVERNANCE_ACTIONS.includes("create-violation"));
  assert.ok(AFENDA_AGENT_GOVERNANCE_ACTIONS.includes("run-verification"));
  assert.ok(
    AFENDA_AGENT_GOVERNANCE_FORBIDDEN_ACTIONS.includes("weaken-rule-to-pass")
  );
  assert.ok(
    AFENDA_AGENT_GOVERNANCE_FORBIDDEN_ACTIONS.includes(
      "apply-remediation-outside-approved-scope"
    )
  );
  assert.ok(
    AFENDA_AGENT_GOVERNANCE_FORBIDDEN_ACTIONS.includes(
      "claim-human-approval-without-record"
    )
  );
  assert.ok(AFENDA_AGENT_GOVERNANCE_RISK_LEVELS.includes("critical"));
  assert.ok(AFENDA_AGENT_GOVERNANCE_QUALITY_GATES.includes("typecheck"));
  assert.ok(AFENDA_AGENT_GOVERNANCE_QUALITY_GATES.includes("test"));
  assert.ok(AFENDA_AGENT_GOVERNANCE_QUALITY_GATES.includes("tenant-scope-check"));
  assert.ok(
    AFENDA_AGENT_GOVERNANCE_QUALITY_GATES.includes("runtime-diagnostics-check")
  );
  assert.ok(
    AFENDA_AGENT_GOVERNANCE_GOVERNANCE_REFERENCES.includes(
      "AFENDA:remediation-contract"
    )
  );
  assert.ok(
    AFENDA_AGENT_GOVERNANCE_GOVERNANCE_REFERENCES.includes(
      "AFENDA:approval-policy-contract"
    )
  );
  assert.equal(
    afendaAgentGovernanceContract.sourceRemediationContractId,
    "afenda.remediation-contract"
  );
  assert.ok(
    afendaAgentGovernanceContract.policies.some(
      (policy) => policy.policyId === "agent-governance.blocking-violation-stop"
    )
  );
  assert.ok(
    afendaAgentGovernanceContract.policies.some(
      (policy) =>
        policy.policyId === "agent-governance.no-rule-weakening" &&
        policy.forbiddenActions?.includes("remove-test-to-pass")
    )
  );
  assert.ok(
    afendaAgentGovernanceContract.policies.some(
      (policy) =>
        policy.policyId === "agent-governance.scope-safe-remediation" &&
        policy.scopeRequired === true &&
        policy.qualityGates?.includes("tenant-scope-check")
    )
  );

  const decidedBy = {
    type: "agent",
    name: "afenda-runtime-agent",
    version: "0.1.0",
  } as const;
  const decision = {
    decisionId: "decision_blocking_violation_stop_001",
    policyId: "agent-governance.blocking-violation-stop",
    violationId: "violation_accessibility_icon_button_label_001",
    remediationPlanId: "remediation_accessibility_icon_button_label_001",
    evaluationBatchId: "batch_2026_06_13_afenda_rules",
    evaluationResultId: "src/Button.tsx:42:accessibility.icon-button-label",
    allowed: false,
    blocking: true,
    reason: "Blocking violation requires remediation before completion.",
    scope: {
      packageName: "@repo/design-system",
      featureId: "afenda-contract",
    },
    decidedBy,
    decidedAt: "2026-06-13T00:00:00.000Z",
    approvalRequired: true,
    verificationEvidence: ["pnpm typecheck passed", "pnpm test passed"],
    verificationPassed: true,
    requiredActions: [
      "create-violation",
      "create-remediation-plan",
      "stop-on-blocking-violation",
    ],
    forbiddenActions: ["ignore-blocking-violation"],
    qualityGates: ["typecheck", "test"],
    auditEventId: "audit_evt_agent_governance_001",
    correlationId: "corr_001",
  } as const;

  validateAfendaAgentGovernanceDecision(decision);
  assert.throws(() =>
    validateAfendaAgentGovernanceDecision({
      ...decision,
      decisionId: "decision_disallowed_without_blocking_or_forbidden",
      blocking: false,
      forbiddenActions: [],
    })
  );
  assert.throws(() =>
    validateAfendaAgentGovernanceDecision({
      ...decision,
      decisionId: "decision_approval_required_without_blocking_or_approval",
      allowed: true,
      blocking: false,
      approvalRequired: true,
    })
  );
  assert.throws(() =>
    validateAfendaAgentGovernanceDecision({
      ...decision,
      decisionId: "decision_verification_passed_without_evidence",
      verificationEvidence: [],
      verificationPassed: true,
    })
  );
  validateAfendaAgentGovernanceDecision({
    ...decision,
    decisionId: "decision_approved_scope_remediation",
    policyId: "agent-governance.scope-safe-remediation",
    allowed: true,
    blocking: false,
    approvalRequired: true,
    approvedBy: {
      type: "manual-review",
      name: "tenant-owner",
    },
    approvedAt: "2026-06-13T01:00:00.000Z",
    approvalReason: "Tenant-scoped remediation approved for demo company.",
    requiredActions: [
      "request-human-approval",
      "record-audit-event",
      "run-verification",
    ],
    forbiddenActions: [
      "cross-tenant-remediation-without-scope",
      "apply-remediation-outside-approved-scope",
    ],
    qualityGates: ["tenant-scope-check", "security-review"],
  });
});

test("afenda quality gate contract makes minimal pass warn block decisions", () => {
  validateAfendaQualityGateContract();

  assert.equal(afendaQualityGateContract.id, AFENDA_QUALITY_GATE_CONTRACT_ID);
  assert.deepEqual(AFENDA_QUALITY_GATE_STATUSES, ["pass", "warn", "block"]);
  assert.deepEqual(afendaQualityGateContract.governanceReferences, [
    "AFENDA:runtime-reference-contract",
    "AFENDA:rule-evaluation-contract",
    "AFENDA:violation-contract",
    "AFENDA:remediation-contract",
    "AFENDA:agent-governance-contract",
    "AFENDA:quality-gate-contract",
  ]);

  validateAfendaQualityGateDecision({
    id: "quality-gate-decision-1",
    gateId: "afenda.quality-gate.design-system",
    status: "block",
    blocking: true,
    reason: "Blocking violations remain open.",
    sourceEvaluationIds: ["evaluation-result-1"],
    sourceViolationIds: ["violation-1"],
    remediationIds: ["remediation-1"],
    sourceAgentDecisionIds: ["agent-decision-1"],
    scope: {
      packageName: "@repo/design-system",
      moduleId: "afenda",
    },
    decidedBy: {
      type: "ci",
      name: "design-system-test",
    },
    decidedAt: "2026-06-13T00:00:00.000Z",
  });

  assert.throws(() =>
    validateAfendaQualityGateDecision({
      id: "quality-gate-decision-2",
      gateId: "afenda.quality-gate.design-system",
      status: "pass",
      blocking: true,
      reason: "Invalid pass state.",
      sourceEvaluationIds: [],
      sourceViolationIds: [],
      remediationIds: [],
      decidedBy: {
        type: "ci",
        name: "design-system-test",
      },
      decidedAt: "2026-06-13T00:00:00.000Z",
    })
  );
});

test("afenda adapter contract governs migration boundaries", () => {
  assert.equal(afendaAdapterContract.id, AFENDA_ADAPTER_CONTRACT_ID);
  assert.deepEqual(AFENDA_ADAPTER_STATUSES, [
    "mapped",
    "partial",
    "unsupported",
    "manual-review",
    "rejected",
  ]);
  assert.deepEqual(AFENDA_ADAPTER_DIAGNOSTIC_SEVERITIES, [
    "info",
    "warning",
    "error",
  ]);
  assert.ok(AFENDA_ADAPTER_SOURCE_TYPES.includes("legacy-afenda"));
  assert.ok(AFENDA_ADAPTER_SOURCE_TYPES.includes("legacy-tailwind-config"));
  assert.ok(AFENDA_ADAPTER_SOURCE_TYPES.includes("external-figma-token"));
  assert.ok(AFENDA_ADAPTER_TARGET_CONTRACT_IDS.includes("afenda.design-system"));
  assert.ok(
    AFENDA_ADAPTER_TARGET_CONTRACT_IDS.includes(
      "afenda.agent-governance-contract"
    )
  );
  assert.ok(AFENDA_ADAPTER_MAPPING_TRANSFORMS.includes("normalize"));
  assert.ok(AFENDA_ADAPTER_MAPPING_LOSSINESS.includes("high"));
  assert.ok(
    AFENDA_ADAPTER_GOVERNANCE_REFERENCES.includes("AFENDA:migration-boundary")
  );
  assert.ok(
    AFENDA_ADAPTER_GOVERNANCE_REFERENCES.includes(
      "AFENDA:approval-policy-contract"
    )
  );

  const mappedResult = {
    adapterId: "legacy-token-to-afenda-design-system",
    source: {
      sourceId: "legacy-token-contract",
      type: "legacy-token",
      contractId: "legacy.token-contract",
      version: "0.1.0",
      checksum: "sha256:legacy-token-contract-demo",
      capturedAt: "2026-06-13T00:00:00.000Z",
    },
    target: {
      contractId: "afenda.design-system",
      version: "0.1.0",
      exportSubpath: "@repo/design-system/contracts/afenda",
    },
    status: "mapped",
    blocking: false,
    approvalRequired: false,
    confidence: 1,
    fieldMappings: [
      {
        sourcePath: "tokens.color.brand",
        targetPath: "defaults.themePreset",
        status: "mapped",
        transform: "normalize",
        lossiness: "none",
      },
    ],
    diagnostics: [],
    migratedAt: "2026-06-13T00:00:00.000Z",
    migratedBy: "afenda-adapter",
    auditEventId: "audit_evt_adapter_001",
    correlationId: "corr_001",
  } as const;

  validateAfendaAdapterResult(mappedResult);
  validateAfendaAdapterResult({
    ...mappedResult,
    adapterId: "legacy-token-partial",
    status: "partial",
    blocking: true,
    approvalRequired: true,
    approvedBy: "design-system-owner",
    approvedAt: "2026-06-13T01:00:00.000Z",
    approvalReason: "Unsafe permission field rejected from presentation mapping.",
    confidence: 0.75,
    fieldMappings: [
      ...mappedResult.fieldMappings,
      {
        sourcePath: "tokens.permissionFinality",
        targetPath: "governance.forbiddenCustomization",
        status: "rejected",
        transform: "drop",
        lossiness: "high",
        reason: "Permission finality is not presentation authority.",
      },
    ],
    diagnostics: [
      {
        diagnosticId: "diag_permission_finality_rejected",
        severity: "error",
        code: "adapter.security-authority-rejected",
        message:
          "Permission finality cannot migrate into a design-system presentation contract.",
        sourcePath: "tokens.permissionFinality",
        targetPath: "governance.forbiddenCustomization",
        remediation: "Keep permission finality in the permission pipeline.",
        blocking: true,
        ruleId: "adapter.security-authority-rejected",
        reference: "XFORGE:permission-pipeline",
      },
    ],
  });
  assert.throws(() =>
    validateAfendaAdapterResult({
      ...mappedResult,
      adapterId: "legacy-token-partial-without-diagnostics",
      status: "partial",
      blocking: true,
      confidence: 0.75,
    })
  );
  assert.throws(() =>
    validateAfendaAdapterResult({
      ...mappedResult,
      adapterId: "legacy-token-mapped-with-rejected-field",
      blocking: false,
      fieldMappings: [
        {
          sourcePath: "tokens.color.brand",
          targetPath: "defaults.themePreset",
          status: "rejected",
          reason: "Unsafe mapping.",
        },
      ],
    })
  );
  assert.throws(() =>
    validateAfendaAdapterResult({
      ...mappedResult,
      adapterId: "legacy-token-rejected-full-confidence",
      status: "rejected",
      blocking: true,
      confidence: 1,
      diagnostics: [
        {
          diagnosticId: "diag_rejected",
          severity: "error",
          code: "adapter.rejected",
          message: "Rejected mappings cannot claim full confidence.",
        },
      ],
    })
  );
  assert.throws(() =>
    validateAfendaAdapterResult({
      ...mappedResult,
      adapterId: "legacy-token-mapped-lossy-field",
      fieldMappings: [
        {
          sourcePath: "tokens.color.brand",
          targetPath: "defaults.themePreset",
          status: "mapped",
          transform: "derive",
          lossiness: "low",
        },
      ],
    })
  );
  assert.throws(() =>
    validateAfendaAdapterResult({
      ...mappedResult,
      adapterId: "legacy-token-manual-review-without-approval",
      status: "manual-review",
      blocking: true,
      approvalRequired: false,
      confidence: 0.5,
      diagnostics: [
        {
          diagnosticId: "diag_manual_review",
          severity: "warning",
          code: "adapter.manual-review",
          message: "Ambiguous mapping requires approval.",
        },
      ],
    })
  );
});

test("afenda legacy token adapter maps only presentation-safe token inputs", () => {
  validateAfendaLegacyTokenAdapterAlignment();

  assert.equal(AFENDA_LEGACY_TOKEN_ADAPTER_ID, "afenda.adapters.legacy-token");
  assert.deepEqual(
    [...AFENDA_LEGACY_TOKEN_REJECTED_AUTHORITY_PATHS],
    [...AFENDA_FORBIDDEN_CUSTOMIZATION_KEYS]
  );
  assert.ok(
    AFENDA_LEGACY_TOKEN_REJECTED_AUTHORITY_PATHS.includes("permissionFinality")
  );
  assert.ok(
    AFENDA_LEGACY_TOKEN_ADAPTER_GOVERNANCE_REFERENCES.includes(
      "AFENDA:theme-token-contract"
    )
  );
  assert.ok(
    AFENDA_LEGACY_TOKEN_ADAPTER_GOVERNANCE_REFERENCES.includes(
      "XFORGE:tenant-company-scope"
    )
  );

  const mappedResult = createAfendaLegacyTokenAdapterResult({
    source: {
      sourceId: "legacy-token-contract",
      type: "legacy-token",
      contractId: "legacy.token-contract",
      version: "0.1.0",
      checksum: "sha256:legacy-token-contract-demo",
      capturedAt: "2026-06-13T00:00:00.000Z",
    },
    targetVersion: "0.1.0",
    fieldMappings: [
      {
        sourcePath: "tokens.color.brand.primary",
        targetPath: "theme.brand.light.primary",
        status: "mapped",
        transform: "normalize",
        lossiness: "none",
      },
    ],
    migratedAt: "2026-06-13T00:00:00.000Z",
    migratedBy: "afenda-legacy-token-adapter",
  });

  assert.equal(mappedResult.status, "mapped");
  assert.equal(mappedResult.blocking, false);
  assert.equal(mappedResult.approvalRequired, false);
  assert.equal(mappedResult.target.contractId, "afenda.theme-token-contract");
  assert.deepEqual(mappedResult.diagnostics, []);

  const partialResult = createAfendaLegacyTokenAdapterResult({
    source: {
      sourceId: "legacy-token-contract",
      type: "legacy-token",
      contractId: "legacy.token-contract",
      version: "0.1.0",
      checksum: "sha256:legacy-token-contract-demo",
      capturedAt: "2026-06-13T00:00:00.000Z",
    },
    targetVersion: "0.1.0",
    fieldMappings: [
      {
        sourcePath: "tokens.color.brand.primary",
        targetPath: "theme.brand.light.primary",
        status: "mapped",
        transform: "normalize",
        lossiness: "none",
      },
      {
        sourcePath: "tokens.permissionFinality",
        targetPath: "theme.brand.light.primary",
        status: "manual-review",
        reason: "Authority field requires rejection from presentation migration.",
      },
    ],
    approvedBy: "design-system-owner",
    approvedAt: "2026-06-13T01:00:00.000Z",
    approvalReason: "Rejected authority field is blocked from token migration.",
    migratedAt: "2026-06-13T00:00:00.000Z",
    migratedBy: "afenda-legacy-token-adapter",
    auditEventId: "audit_evt_legacy_token_adapter_001",
    correlationId: "corr_legacy_token_adapter_001",
  });

  assert.equal(partialResult.status, "manual-review");
  assert.equal(partialResult.blocking, false);
  assert.equal(partialResult.approvalRequired, true);
  assert.ok(
    partialResult.diagnostics.some(
      (diagnostic) =>
        diagnostic.code === "legacy-token.authority-to-theme-token-rejected"
    )
  );
  assert.equal(partialResult.fieldMappings[1]?.status, "rejected");

  const pendingApprovalResult = createAfendaLegacyTokenAdapterResult({
    source: {
      sourceId: "legacy-token-contract",
      type: "legacy-token",
      contractId: "legacy.token-contract",
      version: "0.1.0",
      checksum: "sha256:legacy-token-contract-demo",
      capturedAt: "2026-06-13T00:00:00.000Z",
    },
    targetVersion: "0.1.0",
    fieldMappings: [
      {
        sourcePath: "tokens.permissionFinality",
        targetPath: "governance.forbiddenCustomization",
        status: "manual-review",
        reason: "Authority field requires rejection from presentation migration.",
      },
    ],
    migratedAt: "2026-06-13T00:00:00.000Z",
    migratedBy: "afenda-legacy-token-adapter",
  });

  assert.equal(pendingApprovalResult.status, "manual-review");
  assert.equal(pendingApprovalResult.blocking, true);
  assert.equal(pendingApprovalResult.approvalRequired, true);
  assert.equal(pendingApprovalResult.confidence, 0.65);

  assert.throws(() =>
    createAfendaLegacyTokenAdapterResult(
      {
        source: {
          sourceId: "legacy-token-contract",
          type: "legacy-theme-preset",
        },
        fieldMappings: [
          {
            sourcePath: "tokens.color.brand.primary",
            targetPath: "theme.brand.light.primary",
            status: "mapped",
          },
        ],
        migratedAt: "2026-06-13T00:00:00.000Z",
        migratedBy: "afenda-legacy-token-adapter",
      } as unknown as Parameters<typeof createAfendaLegacyTokenAdapterResult>[0]
    )
  );
});

test("afenda legacy theme preset adapter maps only governed theme inputs", () => {
  validateAfendaLegacyThemePresetAdapterAlignment();

  assert.equal(
    AFENDA_LEGACY_THEME_PRESET_ADAPTER_ID,
    "afenda.adapters.legacy-theme-preset"
  );
  assert.deepEqual(
    [...AFENDA_LEGACY_THEME_PRESET_CANONICAL_NAMES],
    [...AFENDA_THEME_PRESETS]
  );
  assert.deepEqual(
    [...AFENDA_LEGACY_THEME_PRESET_REJECTED_AUTHORITY_PATHS],
    [...AFENDA_FORBIDDEN_CUSTOMIZATION_KEYS]
  );
  assert.ok(AFENDA_LEGACY_THEME_PRESET_CANONICAL_NAMES.includes("vercel-geist"));
  assert.equal(normalizeLegacyThemePresetName("xforge"), "afenda");
  assert.equal(normalizeLegacyThemePresetName("vercel"), "vercel-geist");
  assert.equal(normalizeLegacyThemePresetName("afenda"), "afenda");
  assert.ok(
    AFENDA_LEGACY_THEME_PRESET_REJECTED_AUTHORITY_PATHS.includes("auditPolicy")
  );
  assert.ok(
    AFENDA_LEGACY_THEME_PRESET_ADAPTER_GOVERNANCE_REFERENCES.includes(
      "AFENDA:theming-contract"
    )
  );

  const mappedResult = createAfendaLegacyThemePresetAdapterResult({
    source: {
      sourceId: "legacy-theme-preset-contract",
      type: "legacy-theme-preset",
      contractId: "legacy.theme-preset-contract",
      version: "0.1.0",
      checksum: "sha256:legacy-theme-preset-demo",
      capturedAt: "2026-06-13T00:00:00.000Z",
    },
    legacyPresetName: " VERCEL-GEIST ",
    targetVersion: "0.1.0",
    fieldMappings: [
      {
        sourcePath: "themePreset.name",
        targetPath: "defaults.themePreset",
        status: "mapped",
        transform: "rename",
        lossiness: "none",
      },
    ],
    migratedAt: "2026-06-13T00:00:00.000Z",
    migratedBy: "afenda-legacy-theme-preset-adapter",
  });

  assert.equal(mappedResult.status, "mapped");
  assert.equal(mappedResult.blocking, false);
  assert.equal(mappedResult.approvalRequired, false);
  assert.equal(mappedResult.target.contractId, "afenda.theme-token-contract");

  const manualReviewResult = createAfendaLegacyThemePresetAdapterResult({
    source: {
      sourceId: "legacy-theme-preset-contract",
      type: "legacy-theme-preset",
      contractId: "legacy.theme-preset-contract",
      version: "0.1.0",
      checksum: "sha256:legacy-theme-preset-demo",
      capturedAt: "2026-06-13T00:00:00.000Z",
    },
    legacyPresetName: "legacy-purple-gradient",
    targetVersion: "0.1.0",
    fieldMappings: [
      {
        sourcePath: "themePreset.name",
        targetPath: "defaults.themePreset",
        status: "manual-review",
        transform: "derive",
        lossiness: "medium",
        reason: "Legacy preset name is not canonical.",
      },
    ],
    approvedBy: "design-system-owner",
    approvedAt: "2026-06-13T01:00:00.000Z",
    approvalReason: "Legacy theme reviewed and mapped to canonical token target.",
    migratedAt: "2026-06-13T00:00:00.000Z",
    migratedBy: "afenda-legacy-theme-preset-adapter",
  });

  assert.equal(manualReviewResult.status, "manual-review");
  assert.equal(manualReviewResult.blocking, false);
  assert.equal(manualReviewResult.approvalRequired, true);
  assert.equal(manualReviewResult.confidence, 0.8);
  assert.ok(
    manualReviewResult.diagnostics.some(
      (diagnostic) =>
        diagnostic.code === "legacy-theme-preset.unapproved-name"
    )
  );

  const rejectedAuthorityResult = createAfendaLegacyThemePresetAdapterResult({
    source: {
      sourceId: "legacy-theme-preset-contract",
      type: "legacy-theme-preset",
      contractId: "legacy.theme-preset-contract",
      version: "0.1.0",
      checksum: "sha256:legacy-theme-preset-demo",
      capturedAt: "2026-06-13T00:00:00.000Z",
    },
    legacyPresetName: "vercel-geist",
    targetVersion: "0.1.0",
    fieldMappings: [
      {
        sourcePath: "themePreset.auditPolicy",
        targetPath: "governance.forbiddenCustomization",
        status: "manual-review",
        reason: "Audit policy cannot migrate into theme preset authority.",
      },
    ],
    approvedBy: "design-system-owner",
    approvedAt: "2026-06-13T01:00:00.000Z",
    approvalReason: "Rejected authority field is blocked from theme migration.",
    migratedAt: "2026-06-13T00:00:00.000Z",
    migratedBy: "afenda-legacy-theme-preset-adapter",
  });

  assert.equal(rejectedAuthorityResult.status, "rejected");
  assert.equal(rejectedAuthorityResult.blocking, true);
  assert.equal(rejectedAuthorityResult.approvalRequired, true);
  assert.equal(rejectedAuthorityResult.confidence, 0.6);
  assert.equal(rejectedAuthorityResult.fieldMappings[0]?.status, "rejected");
  assert.ok(
    rejectedAuthorityResult.diagnostics.some(
      (diagnostic) =>
        diagnostic.code === "legacy-theme-preset.security-authority-rejected"
    )
  );

  const pendingApprovalResult = createAfendaLegacyThemePresetAdapterResult({
    source: {
      sourceId: "legacy-theme-preset-contract",
      type: "legacy-theme-preset",
    },
    legacyPresetName: "legacy-purple-gradient",
    fieldMappings: [
      {
        sourcePath: "themePreset.name",
        targetPath: "defaults.themePreset",
        status: "manual-review",
        reason: "Legacy preset name is not canonical.",
      },
    ],
    migratedAt: "2026-06-13T00:00:00.000Z",
    migratedBy: "afenda-legacy-theme-preset-adapter",
  });

  assert.equal(pendingApprovalResult.status, "manual-review");
  assert.equal(pendingApprovalResult.blocking, true);
  assert.equal(pendingApprovalResult.approvalRequired, true);
  assert.throws(() =>
    createAfendaLegacyThemePresetAdapterResult(
      {
        source: {
          sourceId: "legacy-theme-preset-contract",
          type: "legacy-token",
        },
        legacyPresetName: "vercel-geist",
        fieldMappings: [
          {
            sourcePath: "themePreset.name",
            targetPath: "defaults.themePreset",
            status: "mapped",
          },
        ],
        migratedAt: "2026-06-13T00:00:00.000Z",
        migratedBy: "afenda-legacy-theme-preset-adapter",
      } as unknown as Parameters<
        typeof createAfendaLegacyThemePresetAdapterResult
      >[0]
    )
  );
});

test("afenda legacy component variant adapter maps only governed variants", () => {
  validateAfendaLegacyComponentVariantAdapterAlignment();

  assert.equal(
    AFENDA_LEGACY_COMPONENT_VARIANT_ADAPTER_ID,
    "afenda.adapters.legacy-component-variant"
  );
  assert.deepEqual(
    [...AFENDA_LEGACY_COMPONENT_VARIANT_REJECTED_AUTHORITY_PATHS],
    [...AFENDA_FORBIDDEN_CUSTOMIZATION_KEYS]
  );
  assert.ok(
    AFENDA_LEGACY_COMPONENT_VARIANT_REJECTED_AUTHORITY_PATHS.includes(
      "workflowAuthority"
    )
  );
  assert.ok(
    AFENDA_LEGACY_COMPONENT_VARIANT_ADAPTER_GOVERNANCE_REFERENCES.includes(
      "AFENDA:component-variant-contract"
    )
  );
  assert.ok(
    AFENDA_LEGACY_COMPONENT_VARIANT_ADAPTER_GOVERNANCE_REFERENCES.includes(
      "AFENDA:variant-promotion-contract"
    )
  );

  const mappedResult = createAfendaLegacyComponentVariantAdapterResult({
    source: {
      sourceId: "legacy-component-variant-contract",
      type: "legacy-component-variant",
      contractId: "legacy.component-variant-contract",
      version: "0.1.0",
      checksum: "sha256:legacy-component-variant-demo",
      capturedAt: "2026-06-13T00:00:00.000Z",
    },
    componentType: "button",
    legacyVariantName: " DEFAULT ",
    targetVersion: "0.1.0",
    fieldMappings: [
      {
        sourcePath: "button.variant",
        targetPath: "button.variant",
        status: "mapped",
        transform: "normalize",
        lossiness: "none",
      },
    ],
    migratedAt: "2026-06-13T00:00:00.000Z",
    migratedBy: "afenda-legacy-component-variant-adapter",
  });

  assert.equal(mappedResult.status, "mapped");
  assert.equal(mappedResult.blocking, false);
  assert.equal(mappedResult.approvalRequired, false);
  assert.equal(mappedResult.target.contractId, "afenda.component-variant-contract");

  const manualReviewResult = createAfendaLegacyComponentVariantAdapterResult({
    source: {
      sourceId: "legacy-component-variant-contract",
      type: "legacy-component-variant",
      contractId: "legacy.component-variant-contract",
      version: "0.1.0",
      checksum: "sha256:legacy-component-variant-demo",
      capturedAt: "2026-06-13T00:00:00.000Z",
    },
    componentType: "button",
    legacyVariantName: "primary-gradient",
    targetVersion: "0.1.0",
    fieldMappings: [
      {
        sourcePath: "button.variant",
        targetPath: "button.variant",
        status: "manual-review",
        transform: "derive",
        lossiness: "medium",
        reason: "Legacy variant is not canonical.",
      },
    ],
    approvedBy: "design-system-owner",
    approvedAt: "2026-06-13T01:00:00.000Z",
    approvalReason: "Legacy visual variant reviewed for canonical migration.",
    migratedAt: "2026-06-13T00:00:00.000Z",
    migratedBy: "afenda-legacy-component-variant-adapter",
  });

  assert.equal(manualReviewResult.status, "manual-review");
  assert.equal(manualReviewResult.blocking, false);
  assert.equal(manualReviewResult.approvalRequired, true);
  assert.equal(manualReviewResult.confidence, 0.8);
  assert.ok(
    manualReviewResult.diagnostics.some(
      (diagnostic) =>
        diagnostic.code === "legacy-component-variant.unapproved-name"
    )
  );
  assert.ok(
    manualReviewResult.diagnostics.some(
      (diagnostic) =>
        diagnostic.code === "legacy-component-variant.promotion-available" &&
        diagnostic.metadata?.componentType === "button" &&
        diagnostic.metadata?.legacyVariantName === "primary-gradient"
    )
  );

  const rejectedAuthorityResult = createAfendaLegacyComponentVariantAdapterResult({
    source: {
      sourceId: "legacy-component-variant-contract",
      type: "legacy-component-variant",
      contractId: "legacy.component-variant-contract",
      version: "0.1.0",
      checksum: "sha256:legacy-component-variant-demo",
      capturedAt: "2026-06-13T00:00:00.000Z",
    },
    componentType: "button",
    legacyVariantName: "default",
    targetVersion: "0.1.0",
    fieldMappings: [
      {
        sourcePath: "button.workflowAuthority",
        targetPath: "button.variant",
        status: "manual-review",
        reason: "Workflow authority cannot migrate into component variants.",
      },
    ],
    approvedBy: "design-system-owner",
    approvedAt: "2026-06-13T01:00:00.000Z",
    approvalReason: "Rejected authority field is blocked from variant migration.",
    migratedAt: "2026-06-13T00:00:00.000Z",
    migratedBy: "afenda-legacy-component-variant-adapter",
  });

  assert.equal(rejectedAuthorityResult.status, "rejected");
  assert.equal(rejectedAuthorityResult.blocking, true);
  assert.equal(rejectedAuthorityResult.fieldMappings[0]?.status, "rejected");
  assert.ok(
    rejectedAuthorityResult.diagnostics.some(
      (diagnostic) =>
        diagnostic.code ===
        "legacy-component-variant.security-authority-rejected"
    )
  );

  const rejectedAuthorityTargetResult =
    createAfendaLegacyComponentVariantAdapterResult({
      source: {
        sourceId: "legacy-component-variant-contract",
        type: "legacy-component-variant",
        contractId: "legacy.component-variant-contract",
        version: "0.1.0",
        checksum: "sha256:legacy-component-variant-demo",
        capturedAt: "2026-06-13T00:00:00.000Z",
      },
      componentType: "button",
      legacyVariantName: "default",
      targetVersion: "0.1.0",
      fieldMappings: [
        {
          sourcePath: "button.variant",
          targetPath: "button.permissionVariant",
          status: "mapped",
          transform: "rename",
          lossiness: "none",
        },
      ],
      approvedBy: "design-system-owner",
      approvedAt: "2026-06-13T01:00:00.000Z",
      approvalReason: "Rejected authority target is blocked from variant migration.",
      migratedAt: "2026-06-13T00:00:00.000Z",
      migratedBy: "afenda-legacy-component-variant-adapter",
    });

  assert.equal(rejectedAuthorityTargetResult.status, "rejected");
  assert.equal(rejectedAuthorityTargetResult.fieldMappings[0]?.status, "rejected");

  const pendingApprovalResult = createAfendaLegacyComponentVariantAdapterResult({
    source: {
      sourceId: "legacy-component-variant-contract",
      type: "legacy-component-variant",
    },
    componentType: "badge",
    legacyVariantName: "spotlight",
    fieldMappings: [
      {
        sourcePath: "badge.variant",
        targetPath: "badge.variant",
        status: "manual-review",
        reason: "Legacy badge variant is not canonical.",
      },
    ],
    migratedAt: "2026-06-13T00:00:00.000Z",
    migratedBy: "afenda-legacy-component-variant-adapter",
  });

  assert.equal(pendingApprovalResult.status, "manual-review");
  assert.equal(pendingApprovalResult.blocking, true);
  assert.equal(pendingApprovalResult.approvalRequired, true);

  assert.throws(() =>
    createAfendaLegacyComponentVariantAdapterResult(
      {
        source: {
          sourceId: "legacy-component-variant-contract",
          type: "legacy-token",
        },
        componentType: "button",
        legacyVariantName: "default",
        fieldMappings: [
          {
            sourcePath: "button.variant",
            targetPath: "button.variant",
            status: "mapped",
          },
        ],
        migratedAt: "2026-06-13T00:00:00.000Z",
        migratedBy: "afenda-legacy-component-variant-adapter",
      } as unknown as Parameters<
        typeof createAfendaLegacyComponentVariantAdapterResult
      >[0]
    )
  );
});

test("afenda legacy afenda adapter aggregates child migration results", () => {
  assert.equal(AFENDA_LEGACY_AFENDA_ADAPTER_ID, "afenda.adapters.legacy-afenda");
  assert.deepEqual(AFENDA_LEGACY_AFENDA_ALLOWED_CHILD_ADAPTER_IDS, [
    "afenda.adapters.legacy-token",
    "afenda.adapters.legacy-theme-preset",
    "afenda.adapters.legacy-component-variant",
  ]);
  assert.ok(
    AFENDA_LEGACY_AFENDA_ADAPTER_GOVERNANCE_REFERENCES.includes(
      "AFENDA:design-system-contract"
    )
  );
  assert.ok(
    AFENDA_LEGACY_AFENDA_ADAPTER_GOVERNANCE_REFERENCES.includes(
      "AFENDA:migration-boundary"
    )
  );

  const tokenResult = createAfendaLegacyTokenAdapterResult({
    source: {
      sourceId: "legacy-token-contract",
      type: "legacy-token",
      contractId: "legacy.token-contract",
      version: "0.1.0",
      checksum: "sha256:legacy-token-contract-demo",
      capturedAt: "2026-06-13T00:00:00.000Z",
    },
    targetVersion: "0.1.0",
    fieldMappings: [
      {
        sourcePath: "tokens.color.brand.primary",
        targetPath: "theme.brand.light.primary",
        status: "mapped",
        transform: "normalize",
        lossiness: "none",
      },
    ],
    migratedAt: "2026-06-13T00:00:00.000Z",
    migratedBy: "afenda-legacy-token-adapter",
  });
  const variantResult = createAfendaLegacyComponentVariantAdapterResult({
    source: {
      sourceId: "legacy-component-variant-contract",
      type: "legacy-component-variant",
      contractId: "legacy.component-variant-contract",
      version: "0.1.0",
      checksum: "sha256:legacy-component-variant-demo",
      capturedAt: "2026-06-13T00:00:00.000Z",
    },
    componentType: "button",
    legacyVariantName: "default",
    targetVersion: "0.1.0",
    fieldMappings: [
      {
        sourcePath: "button.variant",
        targetPath: "button.variant",
        status: "mapped",
        transform: "normalize",
        lossiness: "none",
      },
    ],
    migratedAt: "2026-06-13T00:00:00.000Z",
    migratedBy: "afenda-legacy-component-variant-adapter",
  });

  const mappedAggregate = createAfendaLegacyAfendaAdapterResult({
    source: {
      sourceId: "legacy-afenda-contract",
      type: "legacy-afenda",
      contractId: "legacy.afenda-contract",
      version: "0.1.0",
      checksum: "sha256:legacy-afenda-contract-demo",
      capturedAt: "2026-06-13T00:00:00.000Z",
    },
    childResults: [tokenResult, variantResult],
    migratedAt: "2026-06-13T00:00:00.000Z",
    migratedBy: "afenda-legacy-afenda-adapter",
  });

  assert.equal(mappedAggregate.status, "mapped");
  assert.equal(mappedAggregate.blocking, false);
  assert.equal(mappedAggregate.approvalRequired, false);
  assert.equal(mappedAggregate.confidence, 1);
  assert.equal(mappedAggregate.target.contractId, "afenda.design-system");
  assert.deepEqual(mappedAggregate.metadata?.childAdapterIds, [
    "afenda.adapters.legacy-token",
    "afenda.adapters.legacy-component-variant",
  ]);
  assert.ok(
    mappedAggregate.fieldMappings.every((mapping) =>
      mapping.sourcePath.startsWith("afenda.adapters.")
    )
  );

  const manualReviewChild = createAfendaLegacyTokenAdapterResult({
    source: {
      sourceId: "legacy-token-contract",
      type: "legacy-token",
    },
    fieldMappings: [
      {
        sourcePath: "tokens.permissionFinality",
        targetPath: "governance.forbiddenCustomization",
        status: "manual-review",
        reason: "Authority field requires rejection from presentation migration.",
      },
    ],
    migratedAt: "2026-06-13T00:00:00.000Z",
    migratedBy: "afenda-legacy-token-adapter",
  });
  const blockingAggregate = createAfendaLegacyAfendaAdapterResult({
    source: {
      sourceId: "legacy-afenda-contract",
      type: "legacy-afenda",
    },
    childResults: [tokenResult, manualReviewChild],
    migratedAt: "2026-06-13T00:00:00.000Z",
    migratedBy: "afenda-legacy-afenda-adapter",
  });

  assert.equal(blockingAggregate.status, "manual-review");
  assert.equal(blockingAggregate.blocking, true);
  assert.equal(blockingAggregate.approvalRequired, true);
  assert.deepEqual(blockingAggregate.metadata?.approvalRequiredChildAdapterIds, [
    "afenda.adapters.legacy-token",
  ]);
  assert.ok(
    blockingAggregate.diagnostics.some(
      (diagnostic) => diagnostic.code === "legacy-afenda.aggregate-status"
    )
  );

  const duplicateTargetAggregate = createAfendaLegacyAfendaAdapterResult({
    source: {
      sourceId: "legacy-afenda-contract",
      type: "legacy-afenda",
    },
    childResults: [
      tokenResult,
      {
        ...variantResult,
        fieldMappings: [
          {
            sourcePath: "button.variant",
            targetPath: "theme.brand.light.primary",
            status: "mapped",
            transform: "rename",
            lossiness: "none",
          },
        ],
      },
    ],
    migratedAt: "2026-06-13T00:00:00.000Z",
    migratedBy: "afenda-legacy-afenda-adapter",
  });

  assert.equal(duplicateTargetAggregate.status, "mapped");
  assert.ok(
    duplicateTargetAggregate.diagnostics.some(
      (diagnostic) => diagnostic.code === "legacy-afenda.duplicate-target-path"
    )
  );
  assert.deepEqual(duplicateTargetAggregate.metadata?.duplicateTargetPaths, [
    "theme.brand.light.primary",
  ]);

  const unsupportedChildAggregate = createAfendaLegacyAfendaAdapterResult({
    source: {
      sourceId: "legacy-afenda-contract",
      type: "legacy-afenda",
    },
    childResults: [
      {
        ...tokenResult,
        adapterId: "afenda.adapters.unsupported-child",
      },
    ],
    migratedAt: "2026-06-13T00:00:00.000Z",
    migratedBy: "afenda-legacy-afenda-adapter",
  });

  assert.equal(unsupportedChildAggregate.blocking, true);
  assert.ok(
    unsupportedChildAggregate.diagnostics.some(
      (diagnostic) =>
        diagnostic.code === "legacy-afenda.unsupported-child-adapter"
    )
  );

  const emptyAggregate = createAfendaLegacyAfendaAdapterResult({
    source: {
      sourceId: "legacy-afenda-contract",
      type: "legacy-afenda",
    },
    childResults: [],
    migratedAt: "2026-06-13T00:00:00.000Z",
    migratedBy: "afenda-legacy-afenda-adapter",
  });

  assert.equal(emptyAggregate.status, "unsupported");
  assert.equal(emptyAggregate.blocking, true);
  assert.equal(emptyAggregate.confidence, 0);
  assert.ok(
    emptyAggregate.diagnostics.some(
      (diagnostic) => diagnostic.code === "legacy-afenda.no-child-results"
    )
  );

  assert.throws(() =>
    createAfendaLegacyAfendaAdapterResult(
      {
        source: {
          sourceId: "legacy-afenda-contract",
          type: "legacy-token",
        },
        childResults: [tokenResult],
        migratedAt: "2026-06-13T00:00:00.000Z",
        migratedBy: "afenda-legacy-afenda-adapter",
      } as unknown as Parameters<typeof createAfendaLegacyAfendaAdapterResult>[0]
    )
  );
});

test("afenda legacy deprecation boundary points to canonical migration paths", () => {
  validateAfendaLegacyDeprecationManifest();

  assert.equal(afendaLegacyDeprecationManifest.id, AFENDA_LEGACY_DEPRECATION_ID);
  assert.equal(afendaLegacyDeprecationManifest.status, "deprecated");
  assert.equal(afendaLegacyDeprecationManifest.severity, "error");
  assert.equal(afendaLegacyDeprecationManifest.owner, "design-system");
  assert.equal(
    afendaLegacyDeprecationManifest.deprecatedAt,
    "2026-06-13T00:00:00.000Z"
  );
  assert.equal(
    afendaLegacyDeprecationManifest.removalAfter,
    "2026-12-31T00:00:00.000Z"
  );
  assert.deepEqual(AFENDA_LEGACY_DEPRECATED_EXPORTS, [
    "@repo/design-system/contracts/afenda/master",
  ]);
  assert.deepEqual(
    afendaLegacyDeprecationManifest.forbiddenImports,
    AFENDA_LEGACY_DEPRECATED_EXPORTS
  );
  assert.ok(
    AFENDA_LEGACY_MIGRATION_TARGETS.includes(
      "@repo/design-system/contracts/afenda"
    )
  );
  assert.ok(
    AFENDA_LEGACY_MIGRATION_TARGETS.includes(
      "@repo/design-system/contracts/afenda/adapters"
    )
  );
  assert.ok(
    AFENDA_LEGACY_DEPRECATION_POLICIES.includes(
      "legacy-contracts-are-migration-inputs-only"
    )
  );
  assert.ok(
    AFENDA_LEGACY_DEPRECATION_POLICIES.includes(
      "deprecated-master-imports-fail-static-check"
    )
  );
  assert.ok(
    AFENDA_LEGACY_DEPRECATION_POLICIES.includes(
      "migration-must-preserve-canonical-authority"
    )
  );
  assert.ok(
    AFENDA_LEGACY_DEPRECATION_POLICIES.includes(
      "legacy-permission-tenant-audit-execution-fields-must-not-map-to-presentation"
    )
  );
  assert.ok(
    AFENDA_LEGACY_DEPRECATION_GOVERNANCE_REFERENCES.includes(
      "AFENDA:anti-pattern-contract"
    )
  );
  assert.ok(
    AFENDA_LEGACY_DEPRECATION_GOVERNANCE_REFERENCES.includes(
      "AFENDA:adapter-contract"
    )
  );
  assert.deepEqual(
    afendaLegacyDeprecationManifest.deprecatedExports,
    AFENDA_LEGACY_DEPRECATED_EXPORTS
  );
});

test("afenda manifest replaces old master branch export", () => {
  validateAfendaDesignSystemManifest();

  assert.equal(afendaDesignSystemManifest.status, "canonical");
  assert.equal(afendaDesignSystemManifest.exportSubpath, AFENDA_CONTRACT_EXPORT_SUBPATH);
  assert.equal(afendaDesignSystemManifest.contractId, afendaDesignSystemContract.id);
  assert.equal(afendaDesignSystemManifest.version, afendaDesignSystemContract.version);
  assert.ok(
    afendaDesignSystemManifest.governanceReferences.includes(
      "AFENDA:token-ui-contract"
    )
  );
  assert.ok(
    afendaDesignSystemManifest.replaces.includes(
      "@repo/design-system/contracts/afenda/master"
    )
  );
});

test("afenda manifest public exports match package contract subpaths", () => {
  const packageJson = readPackageJson();
  const contractExports = Object.keys(packageJson.exports)
    .filter((exportKey) => exportKey.startsWith("./contracts"))
    .map(resolvePackageExportSubpath)
    .sort();

  assert.deepEqual(
    [...AFENDA_DESIGN_SYSTEM_PUBLIC_EXPORTS].sort(),
    contractExports
  );
  assert.deepEqual(
    [...afendaDesignSystemManifest.publicExports].sort(),
    contractExports
  );
});
