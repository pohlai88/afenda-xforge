import type {
  MetadataUiCompatibilityArea,
  MetadataUiCompatibilityIssue,
  MetadataUiCompatibilityReport,
} from "../compatibility/compose-compatibility";

export type {
  MetadataUiCompatibilityArea,
  MetadataUiCompatibilityIssue,
  MetadataUiCompatibilityReport,
  MetadataUiComposeCompatibilityMap,
} from "../compatibility/compose-compatibility";
export {
  createIssue,
  createMetadataUiComposeCompatibilityReport,
  metadataUiComposeCompatibilityMap,
} from "../compatibility/compose-compatibility";

import {
  createIssue,
  createMetadataUiComposeCompatibilityReport,
} from "../compatibility/compose-compatibility";
import type { MetadataActionSurface } from "../contracts/action-renderer.contract";
import type { MetadataFieldKind } from "../contracts/field-renderer.contract";
import type { MetadataUiState } from "../contracts/render-context.contract";
import type { MetadataSectionKind } from "../contracts/section-renderer.contract";
import { defaultActionRegistry } from "./default-action-registry.tsx";
import { defaultFieldRegistry } from "./default-field-registry.tsx";
import { defaultSectionRegistry } from "./default-section-registry.tsx";
import { defaultStateRegistry } from "./default-state-registry.tsx";

function checkRegistryCoverage<TKey extends string>(
  area: MetadataUiCompatibilityArea,
  registry: { has: (key: TKey) => boolean },
  keys: readonly TKey[],
  issues: MetadataUiCompatibilityIssue[]
): void {
  for (const key of keys) {
    if (!registry.has(key)) {
      issues.push(
        createIssue(area, key, `Default ${area} renderer '${key}' is missing.`)
      );
    }
  }
}

/**
 * Full compatibility report including default renderer registry coverage.
 */
export function createMetadataUiCompatibilityReport(): MetadataUiCompatibilityReport {
  const composeReport = createMetadataUiComposeCompatibilityReport();
  const issues = [...composeReport.issues];

  checkRegistryCoverage(
    "field",
    defaultFieldRegistry,
    composeReport.checked.field as readonly MetadataFieldKind[],
    issues
  );
  checkRegistryCoverage(
    "action",
    defaultActionRegistry,
    composeReport.checked.action as readonly MetadataActionSurface[],
    issues
  );
  checkRegistryCoverage(
    "section",
    defaultSectionRegistry,
    composeReport.checked.section as readonly MetadataSectionKind[],
    issues
  );
  checkRegistryCoverage(
    "state",
    defaultStateRegistry,
    composeReport.checked.state as readonly MetadataUiState[],
    issues
  );

  return {
    checked: composeReport.checked,
    issues,
    ok: issues.length === 0,
  };
}
