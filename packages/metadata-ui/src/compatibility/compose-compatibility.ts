import type { ComposeRegistryGroupName } from "@repo/ui";
import { getComposeRegistryGroup } from "@repo/ui";

import type { MetadataActionSurface } from "../contracts/action-renderer.contract";
import type { MetadataFieldKind } from "../contracts/field-renderer.contract";
import type { MetadataUiState } from "../contracts/render-context.contract";
import type { MetadataSectionKind } from "../contracts/section-renderer.contract";
import { generatedMetadataUiComposeCompatibilityMap } from "../generated/compatibility.generated";

export type MetadataUiCompatibilityArea =
  | "action"
  | "field"
  | "section"
  | "state";

export type MetadataUiCompatibilityIssue = {
  area: MetadataUiCompatibilityArea;
  composeGroup?: ComposeRegistryGroupName;
  key: string;
  message: string;
};

export type MetadataUiCompatibilityReport = {
  checked: Record<MetadataUiCompatibilityArea, readonly string[]>;
  issues: readonly MetadataUiCompatibilityIssue[];
  ok: boolean;
};

export type MetadataUiComposeCompatibilityMap = {
  action: Record<MetadataActionSurface, ComposeRegistryGroupName>;
  field: Record<MetadataFieldKind, ComposeRegistryGroupName>;
  section: Record<MetadataSectionKind, ComposeRegistryGroupName>;
  state: Record<MetadataUiState, ComposeRegistryGroupName>;
};

export const metadataUiComposeCompatibilityMap: MetadataUiComposeCompatibilityMap =
  {
    action: generatedMetadataUiComposeCompatibilityMap.action,
    field: generatedMetadataUiComposeCompatibilityMap.field,
    section: generatedMetadataUiComposeCompatibilityMap.section,
    state: generatedMetadataUiComposeCompatibilityMap.state,
  } satisfies MetadataUiComposeCompatibilityMap;

const getRecordKeys = (record: Record<string, unknown>): readonly string[] =>
  Object.keys(record);

export function createIssue(
  area: MetadataUiCompatibilityArea,
  key: string,
  message: string,
  composeGroup?: ComposeRegistryGroupName
): MetadataUiCompatibilityIssue {
  return { area, composeGroup, key, message };
}

function checkComposeGroup(
  area: MetadataUiCompatibilityArea,
  key: string,
  composeGroup: ComposeRegistryGroupName,
  issues: MetadataUiCompatibilityIssue[]
): void {
  const registryGroup = getComposeRegistryGroup(composeGroup);

  if (!registryGroup) {
    issues.push(
      createIssue(
        area,
        key,
        `Compose group '${composeGroup}' is not registered.`,
        composeGroup
      )
    );
    return;
  }

  if (registryGroup.readiness !== "metadata-ready") {
    issues.push(
      createIssue(
        area,
        key,
        `Compose group '${composeGroup}' is not metadata-ready.`,
        composeGroup
      )
    );
  }
}

/**
 * Server-safe compatibility report: validates manifest compose-group mappings only.
 */
export function createMetadataUiComposeCompatibilityReport(): MetadataUiCompatibilityReport {
  const issues: MetadataUiCompatibilityIssue[] = [];
  const checked = {
    action: getRecordKeys(
      metadataUiComposeCompatibilityMap.action
    ) as unknown as readonly MetadataActionSurface[],
    field: getRecordKeys(
      metadataUiComposeCompatibilityMap.field
    ) as unknown as readonly MetadataFieldKind[],
    section: getRecordKeys(
      metadataUiComposeCompatibilityMap.section
    ) as unknown as readonly MetadataSectionKind[],
    state: getRecordKeys(
      metadataUiComposeCompatibilityMap.state
    ) as unknown as readonly MetadataUiState[],
  };

  for (const key of checked.field) {
    checkComposeGroup(
      "field",
      key,
      metadataUiComposeCompatibilityMap.field[key],
      issues
    );
  }

  for (const key of checked.action) {
    checkComposeGroup(
      "action",
      key,
      metadataUiComposeCompatibilityMap.action[key],
      issues
    );
  }

  for (const key of checked.section) {
    checkComposeGroup(
      "section",
      key,
      metadataUiComposeCompatibilityMap.section[key],
      issues
    );
  }

  for (const key of checked.state) {
    checkComposeGroup(
      "state",
      key,
      metadataUiComposeCompatibilityMap.state[key],
      issues
    );
  }

  return {
    checked,
    issues,
    ok: issues.length === 0,
  };
}
