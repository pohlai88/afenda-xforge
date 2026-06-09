import type { ReactElement } from "react";

import type {
  MetadataFieldContract,
  MetadataFieldRenderer,
} from "../contracts/field-renderer.contract";
import type { MetadataRenderContext } from "../contracts/render-context.contract";
import { defaultFieldRegistry } from "../registry/default-field-registry";

export type MetadataFieldAdapterProps = {
  context: MetadataRenderContext;
  disabled?: boolean;
  field: MetadataFieldContract;
  registry?: typeof defaultFieldRegistry;
  value?: unknown;
};

export function renderMetadataField({
  context,
  disabled,
  field,
  registry = defaultFieldRegistry,
  value,
}: MetadataFieldAdapterProps): ReactElement | null {
  const fieldRenderer = registry.get(
    field.kind ?? "text"
  ) as MetadataFieldRenderer;

  return fieldRenderer({
    context,
    disabled,
    field,
    value,
  });
}
