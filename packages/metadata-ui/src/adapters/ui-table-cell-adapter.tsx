import type { TableColumnMetadata } from "@repo/ui";
import type { ReactElement } from "react";

import type {
  MetadataFieldContract,
  MetadataFieldKind,
} from "../contracts/field-renderer.contract";
import type { MetadataRenderContext } from "../contracts/render-context.contract";
import { createMetadataRenderContext } from "../contracts/render-context.defaults";
import { defaultFieldRegistry } from "../registry/default-field-registry";
import type { MetadataRenderAdapterResult } from "./adapter-result";
import { renderMetadataField } from "./ui-field-adapter";

const resolveTableColumnFieldKind = (
  kind: TableColumnMetadata["kind"] | undefined,
  registry: typeof defaultFieldRegistry
): MetadataFieldKind => {
  if (!kind) {
    return "text";
  }

  return registry.has(kind as MetadataFieldKind)
    ? (kind as MetadataFieldKind)
    : "text";
};

const columnToField = (
  column: TableColumnMetadata,
  registry: typeof defaultFieldRegistry
): MetadataFieldContract => ({
  key: column.key,
  kind: resolveTableColumnFieldKind(column.kind, registry),
  label: column.label,
});

const createTableCellContext = (
  context: MetadataRenderContext | Partial<MetadataRenderContext>
): MetadataRenderContext =>
  createMetadataRenderContext(context, {
    mode: "read",
    surfaceRole: "table-cell",
  });

export type MetadataTableCellAdapterProps = {
  column: TableColumnMetadata;
  context: MetadataRenderContext | Partial<MetadataRenderContext>;
  registry?: typeof defaultFieldRegistry;
  value: unknown;
};

export function renderMetadataTableCellResult({
  column,
  context,
  registry = defaultFieldRegistry,
  value,
}: MetadataTableCellAdapterProps): MetadataRenderAdapterResult<ReactElement | null> {
  const field = columnToField(column, registry);
  const resolvedContext = createTableCellContext(context);

  return renderMetadataField({
    context: {
      ...resolvedContext,
      readonly: true,
      surfaceRole: "table-cell",
    },
    field,
    registry,
    value,
  });
}

export function renderMetadataTableCell(
  column: TableColumnMetadata,
  value: unknown,
  context: MetadataRenderContext | Partial<MetadataRenderContext>,
  registry = defaultFieldRegistry
): ReactElement | null {
  return renderMetadataTableCellResult({
    column,
    context,
    registry,
    value,
  }).element;
}
