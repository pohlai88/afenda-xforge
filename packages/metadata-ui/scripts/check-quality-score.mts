import assert from "node:assert/strict";

import {
  createMetadataUiCompatibilityReport,
  createMetadataUiQualityAssessment,
} from "../src/index.ts";

function resolveThreshold(argv: readonly string[]): number {
  const thresholdIndex = argv.indexOf("--threshold");
  const thresholdValue =
    thresholdIndex === -1 ? undefined : argv[thresholdIndex + 1];
  const parsedThreshold = Number(thresholdValue ?? "90");

  assert.equal(
    Number.isFinite(parsedThreshold),
    true,
    "quality score threshold must be a finite number"
  );

  return parsedThreshold;
}

const threshold = resolveThreshold(process.argv);

const assessment = createMetadataUiQualityAssessment({
  compatibility: createMetadataUiCompatibilityReport(),
  defaultRendererCoverage: true,
  governanceFallbackCoverage: true,
  gracefulUnknownFallbacks: true,
  telemetryCorrelationCoverage: true,
  verification: {
    boundaryLint: true,
    changeNote: true,
    consumerFixture: true,
    declarationSnapshot: true,
    generated: true,
    lint: true,
    publicApi: true,
    telemetrySchema: true,
    test: true,
    typecheck: true,
  },
});

assert.ok(
  assessment.percentage >= threshold,
  `metadata-ui quality score ${assessment.percentage} is below the enforced threshold ${threshold}`
);

console.log(
  `metadata-ui quality score ${assessment.percentage} (${assessment.grade}) meets threshold ${threshold}`
);
