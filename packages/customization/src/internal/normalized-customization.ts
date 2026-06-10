import type {
  EntityMetadata,
  MetadataFeatureContract,
  MetadataTableContract,
} from "@repo/metadata";

import type {
  CustomizationActionOverrideContract,
  CustomizationContract,
  CustomizationFieldOverrideContract,
  CustomizationFilterOverrideContract,
  CustomizationFormOverrideContract,
  CustomizationSectionOverrideContract,
  CustomizationTableColumnOverrideContract,
  CustomizationTableOverrideContract,
} from "../contracts/customization.contract.ts";
import {
  buildMetadataNodeIndex,
  getCanonicalMetadataNodeId,
  resolveMetadataNodeTarget,
} from "./metadata-node-resolution.ts";

type CustomizableMetadata = EntityMetadata | MetadataFeatureContract;

type Keyed = {
  id?: string;
  key: string;
};

type NormalizedIdentity = {
  canonicalId: string;
  canonicalKey: string;
  matchKind: "id" | "key" | "unresolved";
  targetKey: string;
};

export type NormalizedFieldOverride = CustomizationFieldOverrideContract &
  NormalizedIdentity;
export type NormalizedSectionOverride = CustomizationSectionOverrideContract &
  NormalizedIdentity;
export type NormalizedFormOverride = CustomizationFormOverrideContract &
  NormalizedIdentity;
export type NormalizedFilterOverride = CustomizationFilterOverrideContract &
  NormalizedIdentity;
export type NormalizedActionOverride = CustomizationActionOverrideContract &
  NormalizedIdentity;
export type NormalizedTableColumnOverride =
  CustomizationTableColumnOverrideContract & NormalizedIdentity;
export type NormalizedTableOverride = Omit<
  CustomizationTableOverrideContract,
  "columns"
> &
  NormalizedIdentity & {
    columns?: readonly NormalizedTableColumnOverride[];
  };

export type NormalizedCustomizationContract = Omit<
  CustomizationContract,
  "actions" | "fields" | "filters" | "forms" | "sections" | "table" | "tables"
> & {
  actions?: readonly NormalizedActionOverride[];
  fields?: readonly NormalizedFieldOverride[];
  filters?: readonly NormalizedFilterOverride[];
  forms?: readonly NormalizedFormOverride[];
  sections?: readonly NormalizedSectionOverride[];
  table?: Omit<NonNullable<CustomizationContract["table"]>, "columns"> & {
    columns?: readonly NormalizedTableColumnOverride[];
  };
  tables?: readonly NormalizedTableOverride[];
};

const getFeatureTables = (
  metadata: CustomizableMetadata
): readonly MetadataTableContract[] => {
  if (!("tables" in metadata)) {
    return [];
  }

  return (metadata.tables ?? []).filter(
    (table): table is MetadataTableContract => "key" in table
  );
};

const normalizeNodeOverrides = <
  Override extends Keyed,
  MetadataNode extends Keyed,
>(
  overrides: readonly Override[] | undefined,
  metadataNodes: readonly MetadataNode[] | undefined
): readonly (Override & NormalizedIdentity)[] | undefined => {
  if (!overrides) {
    return;
  }

  const metadataIndex = buildMetadataNodeIndex(metadataNodes);

  return overrides.map((override) => {
    const resolvedTarget = resolveMetadataNodeTarget(override, metadataIndex);

    if (!resolvedTarget) {
      return {
        ...override,
        canonicalId: override.id ?? override.key,
        canonicalKey: override.key,
        matchKind: "unresolved",
        targetKey: override.key,
      };
    }

    return {
      ...override,
      canonicalId: resolvedTarget.canonicalId,
      canonicalKey: resolvedTarget.metadataNode.key,
      id: resolvedTarget.canonicalId,
      key: resolvedTarget.metadataNode.key,
      matchKind: resolvedTarget.matchKind,
      targetKey: override.key,
    };
  });
};

const normalizeFeatureTableOverrides = (
  overrides: readonly CustomizationTableOverrideContract[] | undefined,
  metadata: CustomizableMetadata
): readonly NormalizedTableOverride[] | undefined => {
  if (!overrides) {
    return;
  }

  const tables = getFeatureTables(metadata);
  const tableIndex = buildMetadataNodeIndex(tables);

  return overrides.map((override) => {
    const resolvedTarget = resolveMetadataNodeTarget(override, tableIndex);
    const metadataTable = resolvedTarget?.metadataNode;

    return {
      ...override,
      canonicalId:
        resolvedTarget?.canonicalId ??
        override.id ??
        getCanonicalMetadataNodeId(override),
      canonicalKey: metadataTable?.key ?? override.key,
      columns: normalizeNodeOverrides(override.columns, metadataTable?.columns),
      id:
        resolvedTarget?.canonicalId ??
        override.id ??
        getCanonicalMetadataNodeId(override),
      key: metadataTable?.key ?? override.key,
      matchKind: resolvedTarget?.matchKind ?? "unresolved",
      targetKey: override.key,
    };
  });
};

const normalizeEntityTableOverride = (
  override: CustomizationContract["table"],
  metadataTable: EntityMetadata["table"] | undefined
): NormalizedCustomizationContract["table"] => {
  if (!override) {
    return;
  }

  return {
    ...override,
    columns: normalizeNodeOverrides(override.columns, metadataTable?.columns),
  };
};

export const normalizeCustomizationAgainstMetadata = (
  customization: CustomizationContract,
  metadata: CustomizableMetadata
): NormalizedCustomizationContract => ({
  ...customization,
  actions: normalizeNodeOverrides(customization.actions, metadata.actions),
  fields: normalizeNodeOverrides(customization.fields, metadata.fields),
  filters: normalizeNodeOverrides(customization.filters, metadata.filters),
  forms: normalizeNodeOverrides(customization.forms, metadata.forms),
  sections: normalizeNodeOverrides(customization.sections, metadata.sections),
  table: normalizeEntityTableOverride(
    customization.table,
    "table" in metadata ? metadata.table : undefined
  ),
  tables: normalizeFeatureTableOverrides(customization.tables, metadata),
});
