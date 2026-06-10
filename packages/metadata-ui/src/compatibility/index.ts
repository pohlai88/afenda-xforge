export { createMetadataUiCompatibilityReport } from "../registry/metadata-ui-compatibility";
export {
  createIssue,
  createMetadataUiComposeCompatibilityReport,
  type MetadataUiCompatibilityArea,
  type MetadataUiCompatibilityIssue,
  type MetadataUiCompatibilityReport,
  type MetadataUiComposeCompatibilityMap,
  metadataUiComposeCompatibilityMap,
} from "./compose-compatibility";
export type {
  MetadataUiQualityAssessment,
  MetadataUiQualityCategory,
  MetadataUiQualityMetric,
  MetadataUiQualitySignals,
  MetadataUiQualityVerification,
} from "./metadata-ui-quality";

import { createMetadataUiCompatibilityReport } from "../registry/metadata-ui-compatibility";
import type {
  MetadataUiQualityAssessment,
  MetadataUiQualitySignals,
} from "./metadata-ui-quality";
import { createMetadataUiQualityAssessment as createQualityAssessment } from "./metadata-ui-quality";

export function createMetadataUiQualityAssessment(
  signals: MetadataUiQualitySignals = {}
): MetadataUiQualityAssessment {
  return createQualityAssessment(createMetadataUiCompatibilityReport, signals);
}
