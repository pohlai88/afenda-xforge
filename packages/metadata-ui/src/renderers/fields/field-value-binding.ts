import type { ChangeEvent } from "react";

export type MetadataFieldValueBinding = {
  isControlled: boolean;
};

export function resolveFieldValueBinding(
  value: unknown,
  onChange?: (value: unknown) => void
): MetadataFieldValueBinding {
  return {
    isControlled: value !== undefined && typeof onChange === "function",
  };
}

export function createTextInputBinding(
  value: unknown,
  resolvedValue: string,
  onChange?: (value: unknown) => void
): {
  defaultValue?: string;
  onChange?: (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  value?: string;
} {
  const { isControlled } = resolveFieldValueBinding(value, onChange);

  if (isControlled) {
    return {
      onChange: (event): void => {
        onChange?.(event.target.value);
      },
      value: resolvedValue,
    };
  }

  return { defaultValue: resolvedValue };
}

export function createSelectInputBinding(
  value: unknown,
  resolvedValue: string,
  onChange?: (value: unknown) => void
): {
  defaultValue?: string;
  onChange?: (event: ChangeEvent<HTMLSelectElement>) => void;
  value?: string;
} {
  const { isControlled } = resolveFieldValueBinding(value, onChange);

  if (isControlled) {
    return {
      onChange: (event): void => {
        onChange?.(event.target.value);
      },
      value: resolvedValue,
    };
  }

  return { defaultValue: resolvedValue };
}

export function createBooleanInputBinding(
  value: unknown,
  onChange?: (value: unknown) => void
): {
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
} {
  const { isControlled } = resolveFieldValueBinding(value, onChange);
  const checked = Boolean(value);

  if (isControlled) {
    return {
      checked,
      onCheckedChange: (nextChecked): void => {
        onChange?.(nextChecked);
      },
    };
  }

  return { defaultChecked: checked };
}
