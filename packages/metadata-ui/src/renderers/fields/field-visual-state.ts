import type { MetadataDiagnostic } from "../../contracts/diagnostics.contract";
import type { MetadataFieldRendererProps } from "../../contracts/field-renderer.contract";
import type { MetadataRenderDensity } from "../../contracts/render-context.contract";
import { resolveFieldControlDensityClassName } from "../../visualization/density-visual-contract";

export type FieldVisualState = {
  controlId: string;
  describedBy?: string;
  errorId?: string;
  errorMessage?: string;
  hasError: boolean;
  helpId?: string;
  isDisabled: boolean;
  isReadOnly: boolean;
};

const isFieldErrorDiagnostic = (diagnostic: MetadataDiagnostic): boolean =>
  diagnostic.severity === "error" ||
  diagnostic.code === "invalid-contract" ||
  diagnostic.code === "renderer-error";

export function resolveFieldErrorMessage(
  props: MetadataFieldRendererProps
): string | undefined {
  const { context, diagnostics, field } = props;
  const diagnosticError = diagnostics?.find(
    (diagnostic) =>
      diagnostic.target === field.key && isFieldErrorDiagnostic(diagnostic)
  )?.message;

  if (diagnosticError) {
    return diagnosticError;
  }

  if (context.state === "invalid") {
    return `Invalid value for ${field.label}.`;
  }

  const validationMessage = field.validation?.find((rule) =>
    rule.message?.trim()
  )?.message;

  return validationMessage?.trim() || undefined;
}

export function resolveFieldVisualState(
  props: MetadataFieldRendererProps
): FieldVisualState {
  const { context, disabled, field } = props;
  const controlId = field.id ?? field.key;
  const isReadOnly = context.readonly === true || field.readOnly === true;
  const isDisabled =
    (disabled === true || field.disabled === true) && !isReadOnly;
  const errorMessage = resolveFieldErrorMessage(props);
  const hasError = Boolean(errorMessage);
  const helpId = field.helpText ? `${controlId}-help` : undefined;
  const errorId = hasError ? `${controlId}-error` : undefined;
  const describedBy = [helpId, errorId].filter(Boolean).join(" ") || undefined;

  return {
    controlId,
    describedBy,
    errorId,
    errorMessage,
    hasError,
    helpId,
    isDisabled,
    isReadOnly,
  };
}

export function resolveFieldControlClassName(
  visualState: FieldVisualState,
  className?: string,
  density: MetadataRenderDensity = "default"
): string | undefined {
  const readonlyClassName = visualState.isReadOnly
    ? "cursor-default bg-muted/40 read-only:opacity-100"
    : undefined;

  return (
    [className, resolveFieldControlDensityClassName(density), readonlyClassName]
      .filter(Boolean)
      .join(" ") || undefined
  );
}
