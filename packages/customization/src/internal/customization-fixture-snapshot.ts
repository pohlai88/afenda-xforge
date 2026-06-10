import type {
  EntityMetadata,
  EntityTableMetadata,
  MetadataActionContract,
  MetadataFeatureContract,
  MetadataFieldContract,
  MetadataFilterContract,
  MetadataFormContract,
  MetadataSectionContract,
  MetadataTableColumn,
  MetadataTableContract,
} from "@repo/metadata";

import type {
  CustomizationContract,
  CustomizationFixtureMetadataNodeSnapshotContract,
  CustomizationValidationIssue,
  CustomizationValidationSeverity,
} from "../contracts/customization.contract.ts";
import { buildMetadataNodeIndex } from "./metadata-node-resolution.ts";
import { normalizeCustomizationAgainstMetadata } from "./normalized-customization.ts";

type CustomizableMetadata = EntityMetadata | MetadataFeatureContract;

type SnapshotSurface =
  | "action"
  | "entity-table-column"
  | "field"
  | "filter"
  | "form"
  | "section"
  | "table"
  | "table-column";

type SnapshotComparableNode =
  | EntityTableMetadata["columns"][number]
  | MetadataActionContract
  | MetadataFieldContract
  | MetadataFilterContract
  | MetadataFormContract
  | MetadataSectionContract
  | MetadataTableColumn
  | MetadataTableContract;

const toStableJsonValue = (value: unknown): unknown => {
  if (Array.isArray(value)) {
    return value.map((entry) => toStableJsonValue(entry));
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value)
        .sort(([leftKey], [rightKey]) => leftKey.localeCompare(rightKey))
        .map(([key, entryValue]) => [key, toStableJsonValue(entryValue)])
    );
  }

  return value;
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

const getNodeFingerprint = (
  surface: SnapshotSurface,
  node: SnapshotComparableNode
): string => {
  switch (surface) {
    case "field":
      return JSON.stringify(
        toStableJsonValue({
          kind: (node as MetadataFieldContract).kind,
          required: (node as MetadataFieldContract).required ?? false,
        })
      );
    case "section":
      return JSON.stringify(
        toStableJsonValue({
          collapsible: (node as MetadataSectionContract).collapsible ?? false,
          fieldKeys: (node as MetadataSectionContract).fieldKeys,
        })
      );
    case "form":
      return JSON.stringify(
        toStableJsonValue({
          cancelActionKey: (node as MetadataFormContract).cancelActionKey,
          fieldKeys: (node as MetadataFormContract).fieldKeys,
          sectionKeys: (node as MetadataFormContract).sectionKeys,
          submitActionKey: (node as MetadataFormContract).submitActionKey,
        })
      );
    case "filter":
      return JSON.stringify(
        toStableJsonValue({
          field: (node as MetadataFilterContract).field,
          kind: (node as MetadataFilterContract).kind,
          operator: (node as MetadataFilterContract).operator,
          options: (node as MetadataFilterContract).options?.map((option) => ({
            value: option.value,
          })),
        })
      );
    case "action":
      return JSON.stringify(
        toStableJsonValue({
          dangerous: (node as MetadataActionContract).dangerous ?? false,
          kind: (node as MetadataActionContract).kind,
          requiresSelection:
            (node as MetadataActionContract).requiresSelection ?? false,
          stateTransition: (node as MetadataActionContract).stateTransition,
        })
      );
    case "table":
      return JSON.stringify(
        toStableJsonValue({
          columnKeys: (node as MetadataTableContract).columns.map(
            (column) => column.key
          ),
          supports: (node as MetadataTableContract).supports,
        })
      );
    case "table-column":
    case "entity-table-column":
      return JSON.stringify(
        toStableJsonValue({
          field: (node as MetadataTableColumn).field,
          filterable: (node as MetadataTableColumn).filterable ?? false,
          sortable: (node as MetadataTableColumn).sortable ?? false,
        })
      );
    default:
      return JSON.stringify(toStableJsonValue(node));
  }
};

const createNodeSnapshot = (
  path: readonly (number | string)[],
  surface: SnapshotSurface,
  node: SnapshotComparableNode,
  parentNode?: MetadataTableContract | EntityTableMetadata
): CustomizationFixtureMetadataNodeSnapshotContract => ({
  fingerprint: getNodeFingerprint(surface, node),
  metadataNodeId: node.id,
  metadataNodeKey: node.key,
  ...(parentNode?.id ? { parentMetadataNodeId: parentNode.id } : {}),
  ...(parentNode && "key" in parentNode
    ? { parentMetadataNodeKey: parentNode.key }
    : {}),
  path,
  surface,
});

const collectColumnSnapshots = (
  tablePath: readonly (number | string)[],
  columns: readonly { canonicalId: string }[] | undefined,
  metadataColumns:
    | readonly EntityTableMetadata["columns"][number][]
    | readonly MetadataTableColumn[]
    | undefined,
  surface: "entity-table-column" | "table-column",
  parentNode?: MetadataTableContract | EntityTableMetadata
): readonly CustomizationFixtureMetadataNodeSnapshotContract[] => {
  if (!(columns && metadataColumns)) {
    return [];
  }

  const columnIndex = buildMetadataNodeIndex(metadataColumns);

  return columns.flatMap((columnOverride, columnIndexValue) => {
    const metadataColumn = columnIndex.byCanonicalId.get(
      columnOverride.canonicalId
    );

    if (!metadataColumn) {
      return [];
    }

    return [
      createNodeSnapshot(
        [...tablePath, "columns", columnIndexValue],
        surface,
        metadataColumn,
        parentNode
      ),
    ];
  });
};

const pushSnapshots = <
  TNode extends SnapshotComparableNode,
  TOverride extends { canonicalId: string },
>(
  snapshots: CustomizationFixtureMetadataNodeSnapshotContract[],
  overrides: readonly TOverride[] | undefined,
  nodes: readonly TNode[] | undefined,
  surface: SnapshotSurface,
  pathPrefix: readonly (number | string)[]
): void => {
  if (!(overrides && nodes)) {
    return;
  }

  const nodeIndex = buildMetadataNodeIndex(nodes);

  for (const [overrideIndex, override] of overrides.entries()) {
    const node = nodeIndex.byCanonicalId.get(override.canonicalId);

    if (!node) {
      continue;
    }

    snapshots.push(
      createNodeSnapshot([...pathPrefix, overrideIndex], surface, node)
    );
  }
};

export const createCustomizationFixtureMetadataSnapshot = (
  customization: CustomizationContract,
  metadata: CustomizableMetadata
): readonly CustomizationFixtureMetadataNodeSnapshotContract[] => {
  const normalizedCustomization = normalizeCustomizationAgainstMetadata(
    customization,
    metadata
  );
  const snapshots: CustomizationFixtureMetadataNodeSnapshotContract[] = [];

  pushSnapshots(
    snapshots,
    normalizedCustomization.fields,
    metadata.fields,
    "field",
    ["fields"]
  );
  pushSnapshots(
    snapshots,
    normalizedCustomization.sections,
    metadata.sections,
    "section",
    ["sections"]
  );
  pushSnapshots(
    snapshots,
    normalizedCustomization.forms,
    metadata.forms,
    "form",
    ["forms"]
  );
  pushSnapshots(
    snapshots,
    normalizedCustomization.filters,
    metadata.filters,
    "filter",
    ["filters"]
  );
  pushSnapshots(
    snapshots,
    normalizedCustomization.actions,
    metadata.actions,
    "action",
    ["actions"]
  );

  if (normalizedCustomization.tables) {
    const tables = getFeatureTables(metadata);
    const tableIndex = buildMetadataNodeIndex(tables);

    for (const [
      overrideIndex,
      tableOverride,
    ] of normalizedCustomization.tables.entries()) {
      const metadataTable = tableIndex.byCanonicalId.get(
        tableOverride.canonicalId
      );

      if (!metadataTable) {
        continue;
      }

      snapshots.push(
        createNodeSnapshot(["tables", overrideIndex], "table", metadataTable)
      );
      snapshots.push(
        ...collectColumnSnapshots(
          ["tables", overrideIndex],
          tableOverride.columns,
          metadataTable.columns,
          "table-column",
          metadataTable
        )
      );
    }
  }

  if ("table" in metadata && normalizedCustomization.table && metadata.table) {
    snapshots.push(
      ...collectColumnSnapshots(
        ["table"],
        normalizedCustomization.table.columns,
        metadata.table.columns,
        "entity-table-column",
        metadata.table
      )
    );
  }

  return snapshots;
};

const getIssueSeverity = (strict: boolean): CustomizationValidationSeverity =>
  strict ? "error" : "warning";

const getNodeBySnapshot = (
  snapshot: CustomizationFixtureMetadataNodeSnapshotContract,
  metadata: CustomizableMetadata
): SnapshotComparableNode | undefined => {
  const lookupId = snapshot.metadataNodeId ?? snapshot.metadataNodeKey;

  switch (snapshot.surface) {
    case "field":
      return buildMetadataNodeIndex(metadata.fields).byCanonicalId.get(
        lookupId
      );
    case "section":
      return buildMetadataNodeIndex(metadata.sections).byCanonicalId.get(
        lookupId
      );
    case "form":
      return buildMetadataNodeIndex(metadata.forms).byCanonicalId.get(lookupId);
    case "filter":
      return buildMetadataNodeIndex(metadata.filters).byCanonicalId.get(
        lookupId
      );
    case "action":
      return buildMetadataNodeIndex(metadata.actions).byCanonicalId.get(
        lookupId
      );
    case "table":
      return buildMetadataNodeIndex(
        getFeatureTables(metadata)
      ).byCanonicalId.get(lookupId);
    case "table-column": {
      const table = buildMetadataNodeIndex(
        getFeatureTables(metadata)
      ).byCanonicalId.get(
        snapshot.parentMetadataNodeId ?? snapshot.parentMetadataNodeKey ?? ""
      );

      return buildMetadataNodeIndex(table?.columns).byCanonicalId.get(lookupId);
    }
    case "entity-table-column":
      return buildMetadataNodeIndex(
        "table" in metadata ? metadata.table?.columns : undefined
      ).byCanonicalId.get(lookupId);
    default:
      return;
  }
};

export const reviewCustomizationFixtureMetadataSnapshot = (
  fixture: {
    metadataSnapshot?:
      | readonly CustomizationFixtureMetadataNodeSnapshotContract[]
      | undefined;
  },
  metadata: CustomizableMetadata,
  mode: "draft-with-warnings" | "strict"
): readonly CustomizationValidationIssue[] => {
  if (!fixture.metadataSnapshot?.length) {
    return [];
  }

  const severity = getIssueSeverity(mode === "strict");
  const issues: CustomizationValidationIssue[] = [];

  for (const snapshot of fixture.metadataSnapshot) {
    const currentNode = getNodeBySnapshot(snapshot, metadata);

    if (!currentNode) {
      issues.push({
        code: "customization.node_removed",
        hint: "Rebind the customization to a live metadata node or re-export from the source environment.",
        message: `${snapshot.surface} metadata node "${snapshot.metadataNodeKey}" is missing from the target metadata`,
        metadataNodeId: snapshot.metadataNodeId,
        metadataNodeKey: snapshot.metadataNodeKey,
        path: snapshot.path,
        severity,
        surface: snapshot.surface,
        targetNodeId: snapshot.metadataNodeId,
        targetNodeKey: snapshot.metadataNodeKey,
      });
      continue;
    }

    if (currentNode.key !== snapshot.metadataNodeKey) {
      issues.push({
        code: "customization.node_renamed",
        hint: "Refresh the fixture against current metadata so the exported key matches the canonical node key.",
        message: `${snapshot.surface} metadata node "${snapshot.metadataNodeKey}" was renamed to "${currentNode.key}"`,
        metadataNodeId: currentNode.id,
        metadataNodeKey: currentNode.key,
        path: snapshot.path,
        severity,
        surface: snapshot.surface,
        targetNodeId: snapshot.metadataNodeId,
        targetNodeKey: snapshot.metadataNodeKey,
      });
    }

    if (
      getNodeFingerprint(snapshot.surface, currentNode) !== snapshot.fingerprint
    ) {
      issues.push({
        code: "customization.node_shape_drift",
        hint: "Review the customization against the target metadata because the node structure changed since export.",
        message: `${snapshot.surface} metadata node "${currentNode.key}" changed structurally since the fixture was exported`,
        metadataNodeId: currentNode.id,
        metadataNodeKey: currentNode.key,
        path: snapshot.path,
        severity,
        surface: snapshot.surface,
        targetNodeId: snapshot.metadataNodeId,
        targetNodeKey: snapshot.metadataNodeKey,
      });
    }
  }

  return issues;
};
