import type { ReactElement } from "react";

import type { MetadataFieldRendererProps } from "../../contracts/field-renderer.contract";

export function SwitchFieldRenderer({
  field,
  value,
  disabled,
}: MetadataFieldRendererProps): ReactElement {
  return (
    <label className="flex items-center justify-between gap-4 rounded-md border border-border p-3">
      <span className="grid gap-1">
        <span className="font-medium text-sm">{field.label}</span>
        {field.helpText ? (
          <span className="text-muted-foreground text-xs">
            {field.helpText}
          </span>
        ) : null}
      </span>
      <input
        aria-checked={Boolean(value)}
        aria-label={field.label}
        defaultChecked={Boolean(value)}
        disabled={disabled ?? field.disabled ?? field.readOnly}
        id={field.key}
        name={field.key}
        role="switch"
        type="checkbox"
      />
    </label>
  );
}
