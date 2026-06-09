import { Input } from "@repo/ui";
import type { ReactElement } from "react";

import type { MetadataFieldRendererProps } from "../../contracts/field-renderer.contract";

export function NumberFieldRenderer({
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
      <Input
        defaultValue={resolvedValue}
        disabled={disabled ?? field.disabled ?? field.readOnly}
        id={field.key}
        inputMode="decimal"
        name={field.key}
        placeholder={field.placeholder}
        type="number"
      />
      {field.helpText ? (
        <p className="text-muted-foreground text-xs">{field.helpText}</p>
      ) : null}
    </div>
  );
}
