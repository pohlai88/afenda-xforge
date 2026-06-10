import { Badge, Input } from "@repo/ui";
import type { ReactElement } from "react";

import type { MetadataFieldRendererProps } from "../../contracts/field-renderer.contract";
import {
  resolveFieldControlClassName,
  resolveFieldVisualState,
} from "./field-visual-state";
import { MetadataFieldShell } from "./metadata-field-shell";

const resolveTextValue = (value: unknown): string =>
  typeof value === "string" || typeof value === "number" ? String(value) : "";

export function TextFieldRenderer(
  props: MetadataFieldRendererProps
): ReactElement {
  const { context, field, value } = props;
  const visualState = resolveFieldVisualState(props);
  const resolvedValue = resolveTextValue(value);
  const inputType = field.kind === "email" ? "email" : "text";

  if (field.kind === "status") {
    return (
      <MetadataFieldShell
        density={context.density}
        field={field}
        visualState={visualState}
      >
        <Badge
          aria-describedby={visualState.describedBy}
          aria-invalid={visualState.hasError || undefined}
          id={visualState.controlId}
          variant="secondary"
        >
          {resolvedValue || field.placeholder || "—"}
        </Badge>
      </MetadataFieldShell>
    );
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
        defaultValue={resolvedValue}
        disabled={visualState.isDisabled || undefined}
        id={visualState.controlId}
        name={field.key}
        placeholder={field.placeholder}
        readOnly={visualState.isReadOnly || undefined}
        type={inputType}
      />
    </MetadataFieldShell>
  );
}
