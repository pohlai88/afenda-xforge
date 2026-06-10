import { Input } from "@repo/ui";
import type { ReactElement } from "react";

import type { MetadataFieldRendererProps } from "../../contracts/field-renderer.contract";
import {
  formatMetadataMoney,
  resolveMetadataNumberInputValue,
  shouldFormatFieldForDisplay,
} from "../../formatting/metadata-value-formatter";
import {
  resolveFieldControlClassName,
  resolveFieldVisualState,
} from "./field-visual-state";
import { MetadataFieldShell } from "./metadata-field-shell";

export function MoneyFieldRenderer(
  props: MetadataFieldRendererProps
): ReactElement {
  const { context, field, value } = props;
  const visualState = resolveFieldVisualState(props);
  const resolvedValue = shouldFormatFieldForDisplay(context, visualState)
    ? formatMetadataMoney(value, context, field)
    : resolveMetadataNumberInputValue(value);

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
        defaultValue={resolvedValue}
        disabled={visualState.isDisabled || undefined}
        id={visualState.controlId}
        name={field.key}
        placeholder={field.placeholder}
        readOnly={visualState.isReadOnly || undefined}
        step="0.01"
        type={
          shouldFormatFieldForDisplay(context, visualState) ? "text" : "number"
        }
      />
    </MetadataFieldShell>
  );
}
