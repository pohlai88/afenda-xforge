import { Badge, Input } from "@repo/ui";
import type { ReactElement } from "react";

import type { MetadataFieldRendererProps } from "../../contracts/field-renderer.contract";
import { resolveMetadataDisplayValue } from "../../visualization/content-length-visual-contract";
import {
  isMetadataTableCellSurface,
  renderMetadataTableCellEmail,
  renderMetadataTableCellSpan,
  renderMetadataTableCellStatus,
} from "./field-table-cell-display";
import { createTextInputBinding } from "./field-value-binding";
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
  const { context, field, onChange, value } = props;
  const visualState = resolveFieldVisualState(props);
  const resolvedValue = resolveTextValue(value);
  const inputType = field.kind === "email" ? "email" : "text";

  if (isMetadataTableCellSurface(context)) {
    if (field.kind === "status") {
      return renderMetadataTableCellStatus(
        resolvedValue,
        resolveMetadataDisplayValue(
          resolvedValue.trim() ? resolvedValue : (field.placeholder ?? "")
        )
      );
    }

    if (field.kind === "email" && typeof value === "string") {
      return renderMetadataTableCellEmail(value);
    }

    return renderMetadataTableCellSpan(
      resolveMetadataDisplayValue(resolvedValue.trim() ? resolvedValue : value)
    );
  }

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
          {resolveMetadataDisplayValue(
            resolvedValue.trim() ? resolvedValue : field.placeholder
          )}
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
        {...createTextInputBinding(value, resolvedValue, onChange)}
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
