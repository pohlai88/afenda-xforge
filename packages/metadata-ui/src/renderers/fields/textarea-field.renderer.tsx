import { Textarea } from "@repo/ui";
import type { ReactElement } from "react";

import type { MetadataFieldRendererProps } from "../../contracts/field-renderer.contract";
import { resolveDensityTextareaClassName } from "../../visualization/density-visual-contract";
import { createTextInputBinding } from "./field-value-binding";
import {
  resolveFieldControlClassName,
  resolveFieldVisualState,
} from "./field-visual-state";
import { MetadataFieldShell } from "./metadata-field-shell";

export function TextareaFieldRenderer(
  props: MetadataFieldRendererProps
): ReactElement {
  const { context, field, onChange, value } = props;
  const visualState = resolveFieldVisualState(props);
  const resolvedValue =
    typeof value === "string" || typeof value === "number" ? String(value) : "";

  return (
    <MetadataFieldShell
      density={context.density}
      field={field}
      visualState={visualState}
    >
      <Textarea
        aria-describedby={visualState.describedBy}
        aria-invalid={visualState.hasError || undefined}
        className={resolveFieldControlClassName(
          visualState,
          resolveDensityTextareaClassName(context.density),
          context.density
        )}
        {...createTextInputBinding(value, resolvedValue, onChange)}
        disabled={visualState.isDisabled || undefined}
        id={visualState.controlId}
        name={field.key}
        placeholder={field.placeholder}
        readOnly={visualState.isReadOnly || undefined}
      />
    </MetadataFieldShell>
  );
}
