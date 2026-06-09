import { Input } from "@repo/ui/components/input";
import type { ReactElement } from "react";

import type { MetadataFieldRendererProps } from "../../contracts/field-renderer.contract";

const baseInputClassName = "w-full";

export function TextFieldRenderer({
  field,
  value,
  disabled,
}: MetadataFieldRendererProps): ReactElement {
  const resolvedValue =
    typeof value === "string" || typeof value === "number" ? String(value) : "";

  return (
    <div className="grid gap-2">
      <label className="font-medium text-sm leading-none" htmlFor={field.key}>
        {field.label}
      </label>
      <Input
        className={baseInputClassName}
        defaultValue={resolvedValue}
        disabled={disabled ?? field.disabled ?? field.readOnly}
        id={field.key}
        name={field.key}
        placeholder={field.placeholder}
        type="text"
      />
      {field.helpText ? (
        <p className="text-muted-foreground text-xs">{field.helpText}</p>
      ) : null}
    </div>
  );
}
