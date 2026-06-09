import assert from "node:assert/strict";
import { test } from "node:test";

import {
  createMetadataUiCompatibilityReport,
  createMetadataUiQualityAssessment,
} from "../src";

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
