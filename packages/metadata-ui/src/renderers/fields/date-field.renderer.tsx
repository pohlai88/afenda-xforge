import { Input } from "@repo/ui";
import type { ReactElement } from "react";

import type { MetadataFieldRendererProps } from "../../contracts/field-renderer.contract";

const formatDateValue = (value: unknown): string => {
  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }

  if (typeof value === "string") {
    return value;
  }

  return "";
};

export function DateFieldRenderer({
  field,
  value,
  disabled,
}: MetadataFieldRendererProps): ReactElement {
  return (
    <div className="grid gap-2">
      <label className="font-medium text-sm leading-none" htmlFor={field.key}>
        {field.label}
      </label>
      <Input
        defaultValue={formatDateValue(value)}
        disabled={disabled ?? field.disabled ?? field.readOnly}
        id={field.key}
        name={field.key}
        type="date"
      />
      {field.helpText ? (
        <p className="text-muted-foreground text-xs">{field.helpText}</p>
      ) : null}
    </div>
  );
}
