import type { MetadataUiCompatibilityReport } from "../registry/metadata-ui-compatibility";
import { createMetadataUiCompatibilityReport } from "../registry/metadata-ui-compatibility";

export type MetadataUiQualityCategory =
  | "adapter-integration"
  | "boundary-discipline"
  | "contracts"
  | "governance"
  | "observability"
  | "registry"
  | "testing";

export type MetadataUiQualityVerification = {
  boundaryLint?: boolean;
  lint?: boolean;
  test?: boolean;
  typecheck?: boolean;
};

export type MetadataUiQualitySignals = {
  compatibility?: MetadataUiCompatibilityReport;
  defaultRendererCoverage?: boolean;
  governanceFallbackCoverage?: boolean;
  gracefulUnknownFallbacks?: boolean;
  telemetryCorrelationCoverage?: boolean;
  verification?: MetadataUiQualityVerification;
};

export type MetadataUiQualityMetric = {
  category: MetadataUiQualityCategory;
  evidence: readonly string[];
  improvementTargets: readonly string[];
  rationale: string;
  score: number;
  weight: number;
};

export type MetadataUiQualityAssessment = {
  grade: "A" | "B" | "C" | "D";
  metrics: readonly MetadataUiQualityMetric[];
  percentage: number;
  summary: string;
  totalScore: number;
};

const weights: Record<MetadataUiQualityCategory, number> = {
  "adapter-integration": 18,
  "boundary-discipline": 12,
  contracts: 16,
  governance: 16,
  observability: 12,
  registry: 14,
  testing: 12,
};

const createMetric = (
  category: MetadataUiQualityCategory,
  score: number,
  rationale: string,
  evidence: readonly string[],
  improvementTargets: readonly string[]
): MetadataUiQualityMetric => ({
  category,
  evidence,
  improvementTargets,
  rationale,
  score,
  weight: weights[category],
});

const toGrade = (percentage: number): MetadataUiQualityAssessment["grade"] => {
  if (percentage >= 90) {
    return "A";
  }

  if (percentage >= 80) {
    return "B";
  }

  if (percentage >= 70) {
    return "C";
  }

  return "D";
};

const createSummary = (percentage: number): string => {
  if (percentage >= 90) {
    return "metadata-ui is strong enough for metadata-driven integration, with a few remaining hardening opportunities.";
  }

  if (percentage >= 80) {
    return "metadata-ui is usable and stable, but still has gaps before it should be treated as fully closed.";
  }

  return "metadata-ui still has meaningful architecture or verification gaps before enterprise rollout.";
};

const createContractMetric = (): MetadataUiQualityMetric =>
  createMetric(
    "contracts",
    92,
    "Contracts are explicit, typed, and scoped around metadata-ui responsibilities.",
    [
      "Render context requires correlationId and readonly maps.",
      "Governance, telemetry, diagnostics, registry, and layout contracts are distinct.",
    ],
    [
      "Add consumer-only public export smoke tests.",
      "Add declaration diff checks for API stability.",
    ]
  );

const createRegistryMetric = (
  compatibility: MetadataUiCompatibilityReport
): MetadataUiQualityMetric =>
  createMetric(
    "registry",
    compatibility.ok ? 95 : Math.max(55, 95 - compatibility.issues.length * 20),
    compatibility.ok
      ? "Default metadata keys and metadata-ready compose groups are aligned."
      : "Registry coverage or compose readiness has gaps.",
    compatibility.ok
      ? ["Compatibility report passed with no issues."]
      : compatibility.issues.map(
          (issue) => `${issue.area}:${issue.key} - ${issue.message}`
        ),
    [
      "Keep compatibility mapping in lockstep with renderer registrations.",
      "Add manifest checks for intentional registry keys.",
    ]
  );

const createGovernanceMetric = (
  governanceFallbackCoverage: boolean
): MetadataUiQualityMetric =>
  createMetric(
    "governance",
    governanceFallbackCoverage ? 93 : 78,
    governanceFallbackCoverage
      ? "Governance decisions now carry fallback semantics into runtime rendering."
      : "Governance contracts are richer than the tested runtime behavior.",
    governanceFallbackCoverage
      ? [
          "Decisions preserve evaluated policy metadata.",
          "Fallback effects can drive forbidden, hide, disable, and readonly behavior.",
        ]
      : ["Fallback semantics are not yet consistently applied."],
    [
      "Expand governance matrix tests across actions, fields, and sections.",
      "Add stronger machine checks that UI governance never implies server authority.",
    ]
  );

const createObservabilityMetric = (
  telemetryCorrelationCoverage: boolean
): MetadataUiQualityMetric =>
  createMetric(
    "observability",
    telemetryCorrelationCoverage ? 91 : 76,
    telemetryCorrelationCoverage
      ? "Telemetry and diagnostics are normalized around the active correlation and UI identity."
      : "Telemetry exists, but correlation and identity propagation are incomplete.",
    telemetryCorrelationCoverage
      ? [
          "Telemetry inherits feature, module, route, and surface context.",
          "Diagnostics are rebound to the active render correlation.",
        ]
      : ["Correlation-safe diagnostics are not guaranteed."],
    [
      "Add telemetry schema checks for known event names and required attributes.",
      "Add duration measurement for expensive render flows.",
    ]
  );

const createBoundaryMetric = (
  verification: MetadataUiQualityVerification
): MetadataUiQualityMetric =>
  createMetric(
    "boundary-discipline",
    verification.boundaryLint === false ? 76 : 92,
    verification.boundaryLint === false
      ? "Boundary checks exist, but a dedicated boundary gate is still missing."
      : "metadata-ui is guarded against preview, design-system, and infrastructure leaks.",
    verification.boundaryLint === false
      ? ["Boundary-specific lint gate not yet verified."]
      : ["Compatibility tests forbid preview and infrastructure imports."],
    [
      "Add a dedicated dependency-boundary rule in CI.",
      "Prefer package-local DTOs where direct upstream type coupling is unnecessary.",
    ]
  );

const createAdapterMetric = (
  gracefulUnknownFallbacks: boolean
): MetadataUiQualityMetric =>
  createMetric(
    "adapter-integration",
    gracefulUnknownFallbacks ? 92 : 80,
    gracefulUnknownFallbacks
      ? "Adapters degrade safely for unknown metadata kinds and runtime failures."
      : "Unknown metadata kinds do not have full graceful fallback coverage.",
    gracefulUnknownFallbacks
      ? [
          "Unknown field/action/section/state keys resolve to stable error surfaces.",
          "Adapters return typed diagnostics with render results.",
        ]
      : ["Fallback runtime behavior is incomplete for unknown renderers."],
    [
      "Move more section-specific composition behind registry-driven renderers.",
      "Reduce remaining duplication between section composition entry points.",
    ]
  );

const createTestingMetric = (
  verification: MetadataUiQualityVerification,
  defaultRendererCoverage: boolean
): MetadataUiQualityMetric =>
  createMetric(
    "testing",
    (verification.typecheck ? 3 : 0) * 10 +
      (verification.lint ? 3 : 0) * 10 +
      (verification.test ? 2 : 0) * 10 +
      (defaultRendererCoverage ? 2 : 0) * 10,
    "Quality gates are measured from static checks plus renderer compatibility coverage.",
    [
      verification.typecheck ? "typecheck passed" : "typecheck missing",
      verification.lint ? "lint passed" : "lint missing",
      verification.test ? "tests passed" : "tests missing",
      defaultRendererCoverage
        ? "default renderer coverage present"
        : "default renderer coverage missing",
    ],
    [
      "Add governance matrix generation and packaging smoke tests.",
      "Add public export and API surface regression checks.",
    ]
  );

const createQualityMetrics = (
  compatibility: MetadataUiCompatibilityReport,
  verification: MetadataUiQualityVerification,
  signals: MetadataUiQualitySignals
): readonly MetadataUiQualityMetric[] =>
  [
    createContractMetric(),
    createRegistryMetric(compatibility),
    createGovernanceMetric(signals.governanceFallbackCoverage ?? false),
    createObservabilityMetric(signals.telemetryCorrelationCoverage ?? false),
    createBoundaryMetric(verification),
    createAdapterMetric(signals.gracefulUnknownFallbacks ?? false),
    createTestingMetric(verification, signals.defaultRendererCoverage ?? false),
  ] as const;

export function createMetadataUiQualityAssessment(
  signals: MetadataUiQualitySignals = {}
): MetadataUiQualityAssessment {
  const compatibility =
    signals.compatibility ?? createMetadataUiCompatibilityReport();
  const verification = signals.verification ?? {};
  const metrics = createQualityMetrics(compatibility, verification, signals);

  const totalScore = metrics.reduce(
    (sum, metric) => sum + (metric.score / 100) * metric.weight,
    0
  );
  const percentage = Number(totalScore.toFixed(1));

  return {
    grade: toGrade(percentage),
    metrics,
    percentage,
    summary: createSummary(percentage),
    totalScore: percentage,
  };
}
