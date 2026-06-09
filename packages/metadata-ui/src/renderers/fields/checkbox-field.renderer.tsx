import type { ReactElement } from "react";

import type { MetadataFieldRendererProps } from "../../contracts/field-renderer.contract";

export function CheckboxFieldRenderer({
  field,
  value,
  disabled,
}: MetadataFieldRendererProps): ReactElement {
  return (
    <label className="flex items-start gap-3 rounded-md border border-border p-3">
      <input
        aria-label={field.label}
        defaultChecked={Boolean(value)}
        disabled={disabled ?? field.disabled ?? field.readOnly}
        id={field.key}
        name={field.key}
        type="checkbox"
      />
      <span className="grid gap-1">
        <span className="font-medium text-sm">{field.label}</span>
        {field.helpText ? (
          <span className="text-muted-foreground text-xs">
            {field.helpText}
          </span>
        ) : null}
      </span>
    </label>
  );
}
