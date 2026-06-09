import type { ReactElement } from "react";

import type { MetadataFieldRendererProps } from "../../contracts/field-renderer.contract";

const selectClassName =
  "h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none transition-[color,box-shadow] placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50";

export function SelectFieldRenderer({
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
      <select
        className={selectClassName}
        defaultValue={resolvedValue}
        disabled={disabled ?? field.disabled ?? field.readOnly}
        id={field.key}
        name={field.key}
      >
        <option value="">Select an option</option>
        {field.options?.map((option) => (
          <option
            disabled={option.disabled}
            key={option.value}
            value={option.value}
          >
            {option.label}
          </option>
        ))}
      </select>
      {field.helpText ? (
        <p className="text-muted-foreground text-xs">{field.helpText}</p>
      ) : null}
    </div>
  );
}
