import assert from "node:assert/strict";

import {
  createMetadataUiCompatibilityReport,
  createMetadataUiQualityAssessment,
} from "../src";
import { test } from "./test-runtime";

test("metadata-ui quality assessment produces an enterprise-ready score for the hardened path", () => {
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

  assert.equal(assessment.grade, "A");
  assert.equal(assessment.metrics.length, 7);
  assert.ok(assessment.percentage >= 90);
});

test("metadata-ui quality assessment degrades when compatibility and verification signals are weak", () => {
  const assessment = createMetadataUiQualityAssessment({
    compatibility: {
      checked: {
        action: [],
        field: [],
        section: [],
        state: [],
      },
      issues: [
        {
          area: "field",
          key: "money",
          message: "Default field renderer 'money' is missing.",
        },
      ],
      ok: false,
    },
    defaultRendererCoverage: false,
    governanceFallbackCoverage: false,
    gracefulUnknownFallbacks: false,
    telemetryCorrelationCoverage: false,
    verification: {
      boundaryLint: false,
      changeNote: false,
      consumerFixture: false,
      declarationSnapshot: false,
      generated: false,
      lint: false,
      publicApi: false,
      telemetrySchema: false,
      test: true,
      typecheck: false,
    },
  });

  assert.equal(assessment.grade, "D");
  assert.ok(assessment.percentage < 70);
});

test("metadata-ui quality assessment applies expected grade and summary thresholds", () => {
  const baseSignals = {
    compatibility: createMetadataUiCompatibilityReport(),
    defaultRendererCoverage: true,
    governanceFallbackCoverage: true,
    gracefulUnknownFallbacks: true,
    telemetryCorrelationCoverage: true,
  } as const;

  const gradeB = createMetadataUiQualityAssessment({
    ...baseSignals,
    verification: {
      boundaryLint: false,
      changeNote: false,
      consumerFixture: true,
      declarationSnapshot: true,
      generated: false,
      lint: false,
      publicApi: true,
      telemetrySchema: true,
      test: true,
      typecheck: false,
    },
  });

  const gradeC = createMetadataUiQualityAssessment({
    ...baseSignals,
    verification: {
      boundaryLint: true,
      changeNote: false,
      consumerFixture: true,
      declarationSnapshot: false,
      generated: false,
      lint: false,
      publicApi: true,
      telemetrySchema: false,
      test: false,
      typecheck: false,
    },
  });

  assert.equal(gradeB.grade, "B");
  assert.match(gradeB.summary, /usable and stable/i);
  assert.equal(gradeB.percentage >= 80 && gradeB.percentage < 90, true);

  assert.equal(gradeC.grade, "C");
  assert.match(gradeC.summary, /meaningful architecture or verification gaps/i);
  assert.equal(gradeC.percentage >= 70 && gradeC.percentage < 80, true);
});
