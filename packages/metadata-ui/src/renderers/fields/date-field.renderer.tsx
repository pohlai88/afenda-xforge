import { Input } from "@repo/ui";
import type { ReactElement } from "react";

import type { MetadataFieldRendererProps } from "../../contracts/field-renderer.contract";
import {
  formatMetadataDate,
  resolveMetadataDateInputValue,
  shouldFormatFieldForDisplay,
} from "../../formatting/metadata-value-formatter";
import {
  resolveFieldControlClassName,
  resolveFieldVisualState,
} from "./field-visual-state";
import { MetadataFieldShell } from "./metadata-field-shell";

export function DateFieldRenderer(
  props: MetadataFieldRendererProps
): ReactElement {
  const { context, field, value } = props;
  const visualState = resolveFieldVisualState(props);
  const displayFormatted = shouldFormatFieldForDisplay(context, visualState);
  const resolvedValue = displayFormatted
    ? formatMetadataDate(value, context)
    : resolveMetadataDateInputValue(value);

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
        defaultValue={resolvedValue}
        disabled={visualState.isDisabled || undefined}
        id={visualState.controlId}
        name={field.key}
        readOnly={visualState.isReadOnly || undefined}
        type={displayFormatted ? "text" : "date"}
      />
    </MetadataFieldShell>
  );
}
