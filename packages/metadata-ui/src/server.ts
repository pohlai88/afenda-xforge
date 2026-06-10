import "server-only";

/**
 * Server-safe metadata-ui exports for context factories, contracts, policy, and compose compatibility helpers.
 */

export {
  createMetadataUiComposeCompatibilityReport,
  type MetadataUiCompatibilityArea,
  type MetadataUiCompatibilityIssue,
  type MetadataUiCompatibilityReport,
  metadataUiComposeCompatibilityMap,
} from "./compatibility/compose-compatibility";
export type {
  MetadataUiQualityAssessment,
  MetadataUiQualityCategory,
  MetadataUiQualityMetric,
  MetadataUiQualitySignals,
  MetadataUiQualityVerification,
} from "./compatibility/metadata-ui-quality";
export * from "./contracts";
export * from "./policy";

import { createMetadataUiComposeCompatibilityReport } from "./compatibility/compose-compatibility";
import type {
  MetadataUiQualityAssessment,
  MetadataUiQualitySignals,
} from "./compatibility/metadata-ui-quality";
import { createMetadataUiQualityAssessment as createQualityAssessment } from "./compatibility/metadata-ui-quality";

export function createMetadataUiQualityAssessment(
  signals: MetadataUiQualitySignals = {}
): MetadataUiQualityAssessment {
  return createQualityAssessment(
    createMetadataUiComposeCompatibilityReport,
    signals
  );
}
