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
  changeNote?: boolean;
  consumerFixture?: boolean;
  declarationSnapshot?: boolean;
  generated?: boolean;
  lint?: boolean;
  publicApi?: boolean;
  telemetrySchema?: boolean;
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

type WeightedSignal = {
  label: string;
  passed: boolean;
  weight: number;
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

const scoreSignals = (signals: readonly WeightedSignal[]): number => {
  const totalWeight = signals.reduce((sum, signal) => sum + signal.weight, 0);

  if (totalWeight === 0) {
    return 0;
  }

  const passedWeight = signals.reduce(
    (sum, signal) => sum + (signal.passed ? signal.weight : 0),
    0
  );

  return Math.round((passedWeight / totalWeight) * 100);
};

const summarizeSignals = (
  signals: readonly WeightedSignal[],
  additionalEvidence: readonly string[] = [],
  additionalImprovements: readonly string[] = []
): {
  evidence: readonly string[];
  improvementTargets: readonly string[];
} => ({
  evidence: [
    ...signals.filter((signal) => signal.passed).map((signal) => signal.label),
    ...additionalEvidence,
  ],
  improvementTargets: [
    ...signals
      .filter((signal) => !signal.passed)
      .map((signal) => `Pass ${signal.label.toLowerCase()}.`),
    ...additionalImprovements,
  ],
});

const createContractMetric = (
  verification: MetadataUiQualityVerification
): MetadataUiQualityMetric => {
  const signals = [
    {
      label: "Public API verification passed",
      passed: verification.publicApi === true,
      weight: 4,
    },
    {
      label: "Declaration snapshot verification passed",
      passed: verification.declarationSnapshot === true,
      weight: 3,
    },
    {
      label: "Typecheck passed",
      passed: verification.typecheck === true,
      weight: 2,
    },
  ] as const;
  const score = scoreSignals(signals);
  const { evidence, improvementTargets } = summarizeSignals(
    signals,
    [],
    [
      "Keep public exports and declarations aligned with generated package surface.",
    ]
  );

  return createMetric(
    "contracts",
    score,
    score >= 90
      ? "Contract quality is backed by API, declaration, and type-level verification."
      : "Contract quality is only partially verified by the current check set.",
    evidence,
    improvementTargets
  );
};

const createRegistryMetric = (
  compatibility: MetadataUiCompatibilityReport,
  verification: MetadataUiQualityVerification,
  defaultRendererCoverage: boolean
): MetadataUiQualityMetric => {
  const compatibilityScore = compatibility.ok
    ? 100
    : Math.max(0, 100 - compatibility.issues.length * 25);
  const signalScore = scoreSignals([
    {
      label: "Default renderer coverage present",
      passed: defaultRendererCoverage,
      weight: 3,
    },
    {
      label: "Generated registry outputs are current",
      passed: verification.generated === true,
      weight: 2,
    },
  ]);
  const score = Math.round((compatibilityScore * 0.6 + signalScore * 0.4) / 1);
  const { evidence, improvementTargets } = summarizeSignals(
    [
      {
        label: "Default renderer coverage present",
        passed: defaultRendererCoverage,
        weight: 1,
      },
      {
        label: "Generated registry outputs are current",
        passed: verification.generated === true,
        weight: 1,
      },
    ],
    compatibility.ok
      ? ["Compatibility report passed with no issues."]
      : compatibility.issues.map(
          (issue) => `${issue.area}:${issue.key} - ${issue.message}`
        ),
    [
      "Keep compatibility mapping in lockstep with manifest-backed registry entries.",
    ]
  );

  return createMetric(
    "registry",
    score,
    compatibility.ok
      ? "Registry readiness is verified through compatibility checks and generated output validation."
      : "Registry readiness has measurable compatibility or generation gaps.",
    evidence,
    improvementTargets
  );
};

const createGovernanceMetric = (
  verification: MetadataUiQualityVerification,
  governanceFallbackCoverage: boolean
): MetadataUiQualityMetric => {
  const signals = [
    {
      label: "Governance fallback coverage present",
      passed: governanceFallbackCoverage,
      weight: 4,
    },
    {
      label: "Consumer fixture verification passed",
      passed: verification.consumerFixture === true,
      weight: 2,
    },
    {
      label: "Test suite passed",
      passed: verification.test === true,
      weight: 1,
    },
  ] as const;
  const score = scoreSignals(signals);
  const { evidence, improvementTargets } = summarizeSignals(
    signals,
    [],
    [
      "Expand governance matrix coverage across table and section-driven consumer flows.",
    ]
  );

  return createMetric(
    "governance",
    score,
    score >= 90
      ? "Governance behavior is supported by fallback and consumer-path verification."
      : "Governance behavior is specified, but the executed checks do not fully prove the runtime matrix.",
    evidence,
    improvementTargets
  );
};

const createObservabilityMetric = (
  verification: MetadataUiQualityVerification,
  telemetryCorrelationCoverage: boolean
): MetadataUiQualityMetric => {
  const signals = [
    {
      label: "Telemetry correlation coverage present",
      passed: telemetryCorrelationCoverage,
      weight: 4,
    },
    {
      label: "Telemetry schema verification passed",
      passed: verification.telemetrySchema === true,
      weight: 3,
    },
    {
      label: "Consumer fixture verification passed",
      passed: verification.consumerFixture === true,
      weight: 1,
    },
  ] as const;
  const score = scoreSignals(signals);
  const { evidence, improvementTargets } = summarizeSignals(
    signals,
    [],
    ["Add browser-level verification for telemetry on public read surfaces."]
  );

  return createMetric(
    "observability",
    score,
    score >= 90
      ? "Observability quality is supported by correlation-aware tests plus schema verification."
      : "Observability exists, but the executed verification set does not yet prove it end to end.",
    evidence,
    improvementTargets
  );
};

const createBoundaryMetric = (
  verification: MetadataUiQualityVerification
): MetadataUiQualityMetric => {
  const signals = [
    {
      label: "Boundary checks passed",
      passed: verification.boundaryLint === true,
      weight: 4,
    },
    {
      label: "Public API verification passed",
      passed: verification.publicApi === true,
      weight: 2,
    },
    {
      label: "Consumer fixture verification passed",
      passed: verification.consumerFixture === true,
      weight: 1,
    },
  ] as const;
  const score = scoreSignals(signals);
  const { evidence, improvementTargets } = summarizeSignals(
    signals,
    [],
    ["Keep package boundaries enforced in CI before any release path."]
  );

  return createMetric(
    "boundary-discipline",
    score,
    score >= 90
      ? "Boundary discipline is directly backed by dedicated checks and public-surface verification."
      : "Boundary discipline is partly specified but not fully proven by the current verification set.",
    evidence,
    improvementTargets
  );
};

const createAdapterMetric = (
  verification: MetadataUiQualityVerification,
  gracefulUnknownFallbacks: boolean,
  defaultRendererCoverage: boolean
): MetadataUiQualityMetric => {
  const signals = [
    {
      label: "Graceful unknown fallback coverage present",
      passed: gracefulUnknownFallbacks,
      weight: 4,
    },
    {
      label: "Default renderer coverage present",
      passed: defaultRendererCoverage,
      weight: 2,
    },
    {
      label: "Consumer fixture verification passed",
      passed: verification.consumerFixture === true,
      weight: 2,
    },
  ] as const;
  const score = scoreSignals(signals);
  const { evidence, improvementTargets } = summarizeSignals(
    signals,
    [],
    [
      "Reduce duplication between component wrappers and adapter result surfaces.",
    ]
  );

  return createMetric(
    "adapter-integration",
    score,
    score >= 90
      ? "Adapter integration quality is backed by fallback coverage and consumer-path verification."
      : "Adapter integration still relies on assumptions that are not fully exercised by the current checks.",
    evidence,
    improvementTargets
  );
};

const createTestingMetric = (
  verification: MetadataUiQualityVerification
): MetadataUiQualityMetric => {
  const signals = [
    {
      label: "Typecheck passed",
      passed: verification.typecheck === true,
      weight: 2,
    },
    {
      label: "Lint passed",
      passed: verification.lint === true,
      weight: 2,
    },
    {
      label: "Test suite passed",
      passed: verification.test === true,
      weight: 2,
    },
    {
      label: "Consumer fixture verification passed",
      passed: verification.consumerFixture === true,
      weight: 1,
    },
    {
      label: "Generated output verification passed",
      passed: verification.generated === true,
      weight: 1,
    },
    {
      label: "Change-note verification passed",
      passed: verification.changeNote === true,
      weight: 1,
    },
    {
      label: "Telemetry schema verification passed",
      passed: verification.telemetrySchema === true,
      weight: 1,
    },
  ] as const;
  const score = scoreSignals(signals);
  const { evidence, improvementTargets } = summarizeSignals(
    signals,
    [],
    [
      "Add browser smoke verification to complement the current package-local check matrix.",
    ]
  );

  return createMetric(
    "testing",
    score,
    score >= 90
      ? "Testing quality reflects the executed package verification matrix."
      : "Testing quality is limited by missing executed verification gates.",
    evidence,
    improvementTargets
  );
};

const createQualityMetrics = (
  compatibility: MetadataUiCompatibilityReport,
  verification: MetadataUiQualityVerification,
  signals: MetadataUiQualitySignals
): readonly MetadataUiQualityMetric[] =>
  [
    createContractMetric(verification),
    createRegistryMetric(
      compatibility,
      verification,
      signals.defaultRendererCoverage ?? false
    ),
    createGovernanceMetric(
      verification,
      signals.governanceFallbackCoverage ?? false
    ),
    createObservabilityMetric(
      verification,
      signals.telemetryCorrelationCoverage ?? false
    ),
    createBoundaryMetric(verification),
    createAdapterMetric(
      verification,
      signals.gracefulUnknownFallbacks ?? false,
      signals.defaultRendererCoverage ?? false
    ),
    createTestingMetric(verification),
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
