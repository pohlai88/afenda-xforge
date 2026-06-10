import { Checkbox } from "@repo/ui";
import type { ReactElement } from "react";

import type { MetadataFieldRendererProps } from "../../contracts/field-renderer.contract";
import { createBooleanInputBinding } from "./field-value-binding";
import { resolveFieldVisualState } from "./field-visual-state";
import { MetadataFieldShell } from "./metadata-field-shell";

export function CheckboxFieldRenderer(
  props: MetadataFieldRendererProps
): ReactElement {
  const { context, field, onChange, value } = props;
  const visualState = resolveFieldVisualState(props);
  const isLocked = visualState.isDisabled || visualState.isReadOnly;

  return (
    <MetadataFieldShell
      density={context.density}
      field={field}
      orientation="horizontal"
      visualState={visualState}
    >
      <Checkbox
        aria-describedby={visualState.describedBy}
        aria-invalid={visualState.hasError || undefined}
        {...createBooleanInputBinding(value, onChange)}
        disabled={isLocked || undefined}
        id={visualState.controlId}
        name={field.key}
      />
    </MetadataFieldShell>
  );
}
