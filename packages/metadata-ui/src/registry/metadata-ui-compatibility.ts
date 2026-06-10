import type { ComposeRegistryGroupName } from "@repo/ui";
import { getComposeRegistryGroup } from "@repo/ui";

import { metadataUiStateKeys } from "../adapters/state-renderers";
import type { MetadataActionSurface } from "../contracts/action-renderer.contract";
import type { MetadataFieldKind } from "../contracts/field-renderer.contract";
import type { MetadataUiState } from "../contracts/render-context.contract";
import type { MetadataSectionKind } from "../contracts/section-renderer.contract";
import { generatedMetadataUiComposeCompatibilityMap } from "../generated/compatibility.generated";
import { defaultActionRegistry } from "./default-action-registry.tsx";
import { defaultFieldRegistry } from "./default-field-registry.tsx";
import { defaultSectionRegistry } from "./default-section-registry.tsx";
import { defaultStateRegistry } from "./default-state-registry.tsx";

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

function createIssue(
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

export function createMetadataUiCompatibilityReport(): MetadataUiCompatibilityReport {
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
    state: [...metadataUiStateKeys],
  };

  checkRegistryCoverage("field", defaultFieldRegistry, checked.field, issues);
  checkRegistryCoverage(
    "action",
    defaultActionRegistry,
    checked.action,
    issues
  );
  checkRegistryCoverage(
    "section",
    defaultSectionRegistry,
    checked.section,
    issues
  );
  checkRegistryCoverage("state", defaultStateRegistry, checked.state, issues);

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
