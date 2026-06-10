import { Field, FieldDescription, FieldError, FieldLabel } from "@repo/ui";
import type { ReactElement, ReactNode } from "react";

import type { MetadataFieldContract } from "../../contracts/field-renderer.contract";
import type { MetadataRenderDensity } from "../../contracts/render-context.contract";
import { resolveDensitySurfaceProps } from "../../visualization/density-visual-contract";
import type { FieldVisualState } from "./field-visual-state";

type MetadataFieldShellProps = {
  children: ReactNode;
  density?: MetadataRenderDensity;
  field: MetadataFieldContract;
  orientation?: "horizontal" | "responsive" | "vertical";
  visualState: FieldVisualState;
};

export function MetadataFieldShell({
  children,
  density = "default",
  field,
  orientation = "vertical",
  visualState,
}: MetadataFieldShellProps): ReactElement {
  return (
    <Field
      data-disabled={visualState.isDisabled || undefined}
      data-invalid={visualState.hasError || undefined}
      data-readonly={visualState.isReadOnly || undefined}
      orientation={orientation}
      {...resolveDensitySurfaceProps(density)}
    >
      <FieldLabel htmlFor={visualState.controlId}>
        {field.label}
        {field.required ? (
          <>
            <span aria-hidden="true"> *</span>
            <span className="sr-only"> (required)</span>
          </>
        ) : null}
      </FieldLabel>
      {children}
      {field.helpText && visualState.helpId ? (
        <FieldDescription id={visualState.helpId}>
          {field.helpText}
        </FieldDescription>
      ) : null}
      {visualState.hasError && visualState.errorId ? (
        <FieldError id={visualState.errorId}>
          {visualState.errorMessage}
        </FieldError>
      ) : null}
    </Field>
  );
}
