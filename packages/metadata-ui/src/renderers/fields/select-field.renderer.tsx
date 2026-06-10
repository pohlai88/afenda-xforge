import { NativeSelect, NativeSelectOption } from "@repo/ui";
import type { ReactElement } from "react";

import type { MetadataFieldRendererProps } from "../../contracts/field-renderer.contract";
import { createSelectInputBinding } from "./field-value-binding";
import {
  resolveFieldControlClassName,
  resolveFieldVisualState,
} from "./field-visual-state";
import { MetadataFieldShell } from "./metadata-field-shell";

export function SelectFieldRenderer(
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
      <NativeSelect
        aria-describedby={visualState.describedBy}
        aria-invalid={visualState.hasError || undefined}
        className={resolveFieldControlClassName(
          visualState,
          "w-full",
          context.density
        )}
        {...createSelectInputBinding(value, resolvedValue, onChange)}
        disabled={visualState.isDisabled || visualState.isReadOnly || undefined}
        id={visualState.controlId}
        name={field.key}
      >
        <NativeSelectOption value="">
          {field.placeholder ?? "Select an option"}
        </NativeSelectOption>
        {field.options?.map((option) => (
          <NativeSelectOption
            disabled={option.disabled}
            key={option.value}
            value={option.value}
          >
            {option.label}
          </NativeSelectOption>
        ))}
      </NativeSelect>
    </MetadataFieldShell>
  );
}
