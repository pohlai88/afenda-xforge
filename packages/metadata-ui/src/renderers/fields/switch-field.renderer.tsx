import { Switch } from "@repo/ui";
import type { ReactElement } from "react";

import type { MetadataFieldRendererProps } from "../../contracts/field-renderer.contract";
import { resolveFieldVisualState } from "./field-visual-state";
import { MetadataFieldShell } from "./metadata-field-shell";

export function SwitchFieldRenderer(
  props: MetadataFieldRendererProps
): ReactElement {
  const { context, field, value } = props;
  const visualState = resolveFieldVisualState(props);
  const isLocked = visualState.isDisabled || visualState.isReadOnly;

  return (
    <MetadataFieldShell
      density={context.density}
      field={field}
      orientation="horizontal"
      visualState={visualState}
    >
      <Switch
        aria-describedby={visualState.describedBy}
        aria-invalid={visualState.hasError || undefined}
        defaultChecked={Boolean(value)}
        disabled={isLocked || undefined}
        id={visualState.controlId}
        name={field.key}
      />
    </MetadataFieldShell>
  );
}
