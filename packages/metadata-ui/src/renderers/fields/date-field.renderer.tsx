import { Input } from "@repo/ui";
import type { ReactElement } from "react";

import type { MetadataFieldRendererProps } from "../../contracts/field-renderer.contract";
import {
  formatMetadataDate,
  resolveMetadataDateInputValue,
  shouldFormatFieldForDisplay,
} from "../../formatting/metadata-value-formatter";
import {
  isMetadataTableCellSurface,
  renderMetadataTableCellSpan,
} from "./field-table-cell-display";
import { createTextInputBinding } from "./field-value-binding";
import {
  resolveFieldControlClassName,
  resolveFieldVisualState,
} from "./field-visual-state";
import { MetadataFieldShell } from "./metadata-field-shell";

export function DateFieldRenderer(
  props: MetadataFieldRendererProps
): ReactElement {
  const { context, field, onChange, value } = props;
  const visualState = resolveFieldVisualState(props);
  const displayFormatted = shouldFormatFieldForDisplay(context, visualState);
  const resolvedValue = displayFormatted
    ? formatMetadataDate(value, context)
    : resolveMetadataDateInputValue(value);

  if (isMetadataTableCellSurface(context)) {
    return renderMetadataTableCellSpan(resolvedValue, undefined, {
      "data-locale-formatted": field.kind,
      title: resolvedValue,
    });
  }

  return (
    <MetadataFieldShell
      density={context.density}
      field={field}
      visualState={visualState}
    >
      <Input
        aria-describedby={visualState.describedBy}
        aria-invalid={visualState.hasError || undefined}
        className={resolveFieldControlClassName(
          visualState,
          "w-full",
          context.density
        )}
        {...createTextInputBinding(value, resolvedValue, onChange)}
        disabled={visualState.isDisabled || undefined}
        id={visualState.controlId}
        name={field.key}
        readOnly={visualState.isReadOnly || undefined}
        type={displayFormatted ? "text" : "date"}
      />
    </MetadataFieldShell>
  );
}
