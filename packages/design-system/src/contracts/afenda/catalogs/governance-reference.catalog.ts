import {
  defineGovernanceReferences,
  defineUniqueStringList,
} from "../../registry.schema";

/** Canonical Afenda contract and registry governance IDs. */
export const AFENDA_GOV_DESIGN_SYSTEM = "AFENDA:design-system-contract" as const;
export const AFENDA_GOV_RUNTIME_REFERENCE =
  "AFENDA:runtime-reference-contract" as const;
export const AFENDA_GOV_TOKEN_UI = "AFENDA:token-ui-contract" as const;
export const AFENDA_GOV_GLOBALS_CSS = "AFENDA:globals-css-contract" as const;
export const AFENDA_GOV_RUNTIME_TOKEN_RESOLUTION =
  "AFENDA:runtime-token-resolution-contract" as const;
export const AFENDA_GOV_THEMING = "AFENDA:theming-contract" as const;
export const AFENDA_GOV_VISUAL_DESIGN = "AFENDA:visual-design-contract" as const;
export const AFENDA_GOV_THEME_TOKEN = "AFENDA:theme-token-contract" as const;
export const AFENDA_GOV_QUALITY_GATE = "AFENDA:quality-gate-contract" as const;
export const AFENDA_GOV_VERCEL_GEIST = "AFENDA:vercel-geist-reference" as const;
export const AFENDA_GOV_ADAPTER = "AFENDA:adapter-contract" as const;
export const AFENDA_GOV_MANIFEST = "AFENDA:manifest-contract" as const;
export const AFENDA_GOV_LEGACY_DEPRECATION_MANIFEST =
  "AFENDA:legacy-deprecation-manifest" as const;

export const AFENDA_GOV_RULE_EVALUATION =
  "AFENDA:rule-evaluation-contract" as const;
export const AFENDA_GOV_VIOLATION = "AFENDA:violation-contract" as const;
export const AFENDA_GOV_REMEDIATION = "AFENDA:remediation-contract" as const;
export const AFENDA_GOV_AGENT_GOVERNANCE =
  "AFENDA:agent-governance-contract" as const;
export const AFENDA_GOV_AUDIT = "AFENDA:audit-contract" as const;
export const AFENDA_GOV_OBSERVABILITY = "AFENDA:observability-contract" as const;

export const AFENDA_GOV_EXECUTION_CONTEXT =
  "AFENDA:execution-context-contract" as const;
export const AFENDA_GOV_PERMISSION = "AFENDA:permission-contract" as const;
export const AFENDA_GOV_SLA = "AFENDA:sla-contract" as const;
export const AFENDA_GOV_SUPPRESSION_POLICY =
  "AFENDA:suppression-policy-contract" as const;
export const AFENDA_GOV_RISK_POLICY = "AFENDA:risk-policy-contract" as const;
export const AFENDA_GOV_RUNTIME_DIAGNOSTICS =
  "AFENDA:runtime-diagnostics-contract" as const;
export const AFENDA_GOV_APPROVAL_POLICY =
  "AFENDA:approval-policy-contract" as const;
export const AFENDA_GOV_VERIFICATION = "AFENDA:verification-contract" as const;
export const AFENDA_GOV_MIGRATION_BOUNDARY =
  "AFENDA:migration-boundary" as const;

export const AFENDA_GOV_TENANT_CONTEXT =
  "AFENDA:tenant-context-contract" as const;
export const AFENDA_GOV_TENANT_BRANDING =
  "AFENDA:tenant-branding-contract" as const;
export const AFENDA_GOV_SECURITY_UI = "AFENDA:security-ui-contract" as const;
export const AFENDA_GOV_HYDRATION = "AFENDA:hydration-contract" as const;

export const AFENDA_GOV_LAYOUT = "AFENDA:layout-contract" as const;
export const AFENDA_GOV_TOUCH_LAYOUT = "AFENDA:touch-layout-contract" as const;
export const AFENDA_GOV_TYPOGRAPHY = "AFENDA:typography-contract" as const;
export const AFENDA_GOV_MOTION = "AFENDA:motion-contract" as const;
export const AFENDA_GOV_INTERACTION = "AFENDA:interaction-contract" as const;
export const AFENDA_GOV_PERFORMANCE = "AFENDA:performance-contract" as const;
export const AFENDA_GOV_ELEVATION = "AFENDA:elevation-contract" as const;
export const AFENDA_GOV_FORMS = "AFENDA:forms-contract" as const;
export const AFENDA_GOV_DATA_DISPLAY = "AFENDA:data-display-contract" as const;
export const AFENDA_GOV_CONTENT = "AFENDA:content-contract" as const;
export const AFENDA_GOV_LOCALE = "AFENDA:locale-contract" as const;
export const AFENDA_GOV_COPY = "AFENDA:copy-contract" as const;
export const AFENDA_GOV_NAVIGATION = "AFENDA:navigation-contract" as const;
export const AFENDA_GOV_ACCESSIBILITY =
  "AFENDA:accessibility-contract" as const;
export const AFENDA_GOV_FOCUS = "AFENDA:focus-contract" as const;
export const AFENDA_GOV_STATUS_TONE = "AFENDA:status-tone-contract" as const;
export const AFENDA_GOV_HUE_RESERVATION =
  "AFENDA:hue-reservation-contract" as const;
export const AFENDA_GOV_VARIANT_PROMOTION =
  "AFENDA:variant-promotion-contract" as const;
export const AFENDA_GOV_ANTI_PATTERN = "AFENDA:anti-pattern-contract" as const;
export const AFENDA_GOV_BRAND = "AFENDA:brand-contract" as const;
export const AFENDA_GOV_THEME_VALIDATION =
  "AFENDA:theme-validation-contract" as const;
export const AFENDA_GOV_COMPONENT_VARIANT =
  "AFENDA:component-variant-contract" as const;

export const AFENDA_GOV_THEME_PRESET_REGISTRY =
  "AFENDA:theme-preset-registry" as const;
export const AFENDA_GOV_DENSITY_REGISTRY = "AFENDA:density-registry" as const;
export const AFENDA_GOV_CHART_REGISTRY = "AFENDA:chart-registry" as const;
export const AFENDA_GOV_STATUS_TONE_REGISTRY =
  "AFENDA:status-tone-registry" as const;
export const AFENDA_GOV_COMPONENT_VARIANT_REGISTRY =
  "AFENDA:component-variant-registry" as const;
export const AFENDA_GOV_COMPONENT_SIZE_REGISTRY =
  "AFENDA:component-size-registry" as const;
export const AFENDA_GOV_VISUAL_LANE_REGISTRY =
  "AFENDA:visual-lane-registry" as const;

/** Rule vocabulary — governed references cited by runtime rules. */
export const AFENDA_GOV_ADMIN_SHELL = "AFENDA:admin-shell-contract" as const;
export const AFENDA_GOV_MUTATION = "AFENDA:mutation-contract" as const;
export const AFENDA_GOV_CODE_QUALITY = "AFENDA:code-quality-contract" as const;
export const AFENDA_GOV_DATA_ACCESS = "AFENDA:data-access-contract" as const;
export const AFENDA_GOV_ERROR = "AFENDA:error-contract" as const;
export const AFENDA_GOV_FEEDBACK = "AFENDA:feedback-contract" as const;
export const AFENDA_GOV_PRIVACY = "AFENDA:privacy-contract" as const;
export const AFENDA_GOV_SECURITY = "AFENDA:security-contract" as const;
export const AFENDA_GOV_SEMANTICS = "AFENDA:semantics-contract" as const;
export const AFENDA_GOV_ROUTE_STATE = "AFENDA:route-state-contract" as const;
export const AFENDA_GOV_EMPTY_STATE = "AFENDA:empty-state-contract" as const;
export const AFENDA_GOV_COMPLIANCE = "AFENDA:compliance-contract" as const;
export const AFENDA_GOV_DECISION_SUPPORT =
  "AFENDA:decision-support-contract" as const;
export const AFENDA_GOV_MESSAGE_CATALOG =
  "AFENDA:message-catalog-contract" as const;
export const AFENDA_GOV_FORM_ADAPTER = "AFENDA:form-adapter" as const;
export const AFENDA_GOV_FORM_FIELD = "AFENDA:form-field-contract" as const;
export const AFENDA_GOV_FORM_STATE = "AFENDA:form-state-contract" as const;
export const AFENDA_GOV_FORM_VALIDATION =
  "AFENDA:form-validation-contract" as const;
export const AFENDA_GOV_AUTH = "AFENDA:auth-contract" as const;
export const AFENDA_GOV_VALIDATION = "AFENDA:validation-contract" as const;
export const AFENDA_GOV_ASSET_GOVERNANCE =
  "AFENDA:asset-governance-contract" as const;
export const AFENDA_GOV_IMAGE = "AFENDA:image-contract" as const;
export const AFENDA_GOV_UPLOAD = "AFENDA:upload-contract" as const;
export const AFENDA_GOV_EXPORT = "AFENDA:export-contract" as const;
export const AFENDA_GOV_FINANCE = "AFENDA:finance-contract" as const;
export const AFENDA_GOV_INVENTORY = "AFENDA:inventory-contract" as const;
export const AFENDA_GOV_MANUFACTURING =
  "AFENDA:manufacturing-contract" as const;
export const AFENDA_GOV_MOTION_TOKEN = "AFENDA:motion-token-contract" as const;
export const AFENDA_GOV_BACKGROUND_JOB_SCOPE =
  "AFENDA:background-job-scope-contract" as const;
export const AFENDA_GOV_REALTIME_SCOPE =
  "AFENDA:realtime-scope-contract" as const;
export const AFENDA_GOV_SCOPE_CACHE = "AFENDA:scope-cache-contract" as const;
export const AFENDA_GOV_SCOPE_RESOLUTION =
  "AFENDA:scope-resolution-contract" as const;
export const AFENDA_GOV_SCOPED_EXPORT = "AFENDA:scoped-export-contract" as const;
export const AFENDA_GOV_SCOPED_ROUTE = "AFENDA:scoped-route-contract" as const;
export const AFENDA_GOV_CHART_TOKEN = "AFENDA:chart-token-contract" as const;
export const AFENDA_GOV_DENSITY = "AFENDA:density-contract" as const;
export const AFENDA_GOV_RESPONSIVE_LAYOUT =
  "AFENDA:responsive-layout-contract" as const;
export const AFENDA_GOV_TYPE_SCALE = "AFENDA:type-scale-contract" as const;
export const AFENDA_GOV_VISUAL_STABILITY =
  "AFENDA:visual-stability-contract" as const;
export const AFENDA_GOV_ICON = "AFENDA:icon-contract" as const;
export const AFENDA_GOV_SPACING = "AFENDA:spacing-contract" as const;

export const XFORGE_GOV_PERMISSION_PIPELINE =
  "XFORGE:permission-pipeline" as const;
export const XFORGE_GOV_TENANT_COMPANY_SCOPE =
  "XFORGE:tenant-company-scope" as const;
export const XFORGE_GOV_AUDIT_EVENTS = "XFORGE:audit-events" as const;
export const XFORGE_GOV_MUTATION_PIPELINE = "XFORGE:mutation-pipeline" as const;
export const XFORGE_GOV_REPOSITORY_BOUNDARY =
  "XFORGE:repository-boundary" as const;
export const XFORGE_GOV_EXECUTION_PIPELINE =
  "XFORGE:execution-pipeline" as const;
export const XFORGE_GOV_PACKAGE_BOUNDARIES =
  "XFORGE:package-boundaries" as const;
export const XFORGE_GOV_SERVER_FIRST_UI = "XFORGE:server-first-ui" as const;
export const XFORGE_GOV_EXECUTION_CONTEXT = "XFORGE:execution-context" as const;

/** Color and surface semantics without legacy theme-token alias. */
export const AFENDA_SURFACE_SEMANTIC_GOVERNANCE_REFERENCES =
  defineGovernanceReferences([
    AFENDA_GOV_DESIGN_SYSTEM,
    AFENDA_GOV_THEMING,
    AFENDA_GOV_VISUAL_DESIGN,
  ]);

/** Token catalog, globals CSS, and runtime resolution spine. */
export const AFENDA_TOKEN_PIPELINE_GOVERNANCE_REFERENCES =
  defineGovernanceReferences([
    AFENDA_GOV_DESIGN_SYSTEM,
    AFENDA_GOV_GLOBALS_CSS,
    AFENDA_GOV_RUNTIME_TOKEN_RESOLUTION,
    AFENDA_GOV_THEMING,
    AFENDA_GOV_VISUAL_DESIGN,
  ]);

/** Theme presets and legacy token migration surfaces. */
export const AFENDA_PRESENTATION_GOVERNANCE_REFERENCES =
  defineGovernanceReferences([
    AFENDA_GOV_DESIGN_SYSTEM,
    AFENDA_GOV_THEMING,
    AFENDA_GOV_VISUAL_DESIGN,
    AFENDA_GOV_THEME_TOKEN,
  ]);

export const AFENDA_RUNTIME_PIPELINE_GOVERNANCE_REFERENCES =
  defineGovernanceReferences([
    AFENDA_GOV_RUNTIME_REFERENCE,
    AFENDA_GOV_RULE_EVALUATION,
    AFENDA_GOV_VIOLATION,
    AFENDA_GOV_REMEDIATION,
    AFENDA_GOV_AGENT_GOVERNANCE,
    AFENDA_GOV_AUDIT,
    AFENDA_GOV_OBSERVABILITY,
  ]);

/** Shared policy spine for violation, remediation, and agent governance. */
export const AFENDA_RUNTIME_POLICY_GOVERNANCE_REFERENCES =
  defineGovernanceReferences([
    AFENDA_GOV_EXECUTION_CONTEXT,
    AFENDA_GOV_RISK_POLICY,
    AFENDA_GOV_SUPPRESSION_POLICY,
    XFORGE_GOV_PERMISSION_PIPELINE,
  ]);

export const AFENDA_GOVERNANCE_REFERENCE_CATALOG_ID =
  "afenda.governance-reference-catalog" as const;

export const AFENDA_CANONICAL_GOVERNANCE_REFERENCES = defineUniqueStringList([
  AFENDA_GOV_DESIGN_SYSTEM,
  AFENDA_GOV_RUNTIME_REFERENCE,
  AFENDA_GOV_TOKEN_UI,
  AFENDA_GOV_GLOBALS_CSS,
  AFENDA_GOV_RUNTIME_TOKEN_RESOLUTION,
  AFENDA_GOV_THEMING,
  AFENDA_GOV_VISUAL_DESIGN,
  AFENDA_GOV_THEME_TOKEN,
  AFENDA_GOV_QUALITY_GATE,
  AFENDA_GOV_VERCEL_GEIST,
  AFENDA_GOV_ADAPTER,
  AFENDA_GOV_RULE_EVALUATION,
  AFENDA_GOV_VIOLATION,
  AFENDA_GOV_REMEDIATION,
  AFENDA_GOV_AGENT_GOVERNANCE,
  AFENDA_GOV_LEGACY_DEPRECATION_MANIFEST,
  AFENDA_GOV_AUDIT,
]);
