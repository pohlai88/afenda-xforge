import { Input } from "@repo/ui";
import type { ReactElement } from "react";

import type { MetadataFieldRendererProps } from "../../contracts/field-renderer.contract";
import {
  formatMetadataNumber,
  resolveMetadataNumberInputValue,
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

export function NumberFieldRenderer(
  props: MetadataFieldRendererProps
): ReactElement {
  const { context, field, onChange, value } = props;
  const visualState = resolveFieldVisualState(props);
  const resolvedValue = shouldFormatFieldForDisplay(context, visualState)
    ? formatMetadataNumber(value, context)
    : resolveMetadataNumberInputValue(value);

  if (isMetadataTableCellSurface(context)) {
    return renderMetadataTableCellSpan(resolvedValue, "tabular-nums", {
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
          "w-full tabular-nums",
          context.density
        )}
        {...createTextInputBinding(value, resolvedValue, onChange)}
        disabled={visualState.isDisabled || undefined}
        id={visualState.controlId}
        inputMode="decimal"
        name={field.key}
        placeholder={field.placeholder}
        readOnly={visualState.isReadOnly || undefined}
        type={
          shouldFormatFieldForDisplay(context, visualState) ? "text" : "number"
        }
      />
    </MetadataFieldShell>
  );
}
