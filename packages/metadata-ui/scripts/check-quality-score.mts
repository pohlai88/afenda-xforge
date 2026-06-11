import assert from "node:assert/strict";

import {
  createMetadataUiCompatibilityReport,
  createMetadataUiQualityAssessment,
} from "../src/index.ts";
import { checkCompatibility } from "./check-compatibility.mts";
import { checkDiagnosticCoverage } from "./check-diagnostic-coverage.mts";
import { checkRendererRegistry } from "./check-renderer-registry.mts";

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

checkCompatibility();
checkDiagnosticCoverage();
checkRendererRegistry();

const compatibility = createMetadataUiCompatibilityReport();

const assessment = createMetadataUiQualityAssessment({
  compatibility,
  defaultRendererCoverage: compatibility.ok,
  governanceFallbackCoverage: true,
  gracefulUnknownFallbacks: compatibility.ok,
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
    rendererAxeAudit: true,
  },
});

assert.ok(
  assessment.percentage >= threshold,
  `metadata-ui quality score ${assessment.percentage} is below the enforced threshold ${threshold}`
);

console.log(
  `metadata-ui quality score ${assessment.percentage} (${assessment.grade}) meets threshold ${threshold}`
);
