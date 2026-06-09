import { Input } from "@repo/ui";
import type { ReactElement } from "react";

import type { MetadataFieldRendererProps } from "../../contracts/field-renderer.contract";

export function MoneyFieldRenderer({
  field,
  value,
  disabled,
}: MetadataFieldRendererProps): ReactElement {
  const resolvedValue =
    typeof value === "number" || typeof value === "string" ? String(value) : "";

  return (
    <div className="grid gap-2">
      <label className="font-medium text-sm leading-none" htmlFor={field.key}>
        {field.label}
      </label>
      <div className="grid gap-2">
        {field.placeholder ? (
          <span className="text-muted-foreground text-xs">
            {field.placeholder}
          </span>
        ) : null}
        <Input
          defaultValue={resolvedValue}
          disabled={disabled ?? field.disabled ?? field.readOnly}
          id={field.key}
          name={field.key}
          placeholder={field.placeholder}
          step="0.01"
          type="number"
        />
      </div>
      {field.helpText ? (
        <p className="text-muted-foreground text-xs">{field.helpText}</p>
      ) : null}
    </div>
  );
}
