"use client";

import {
  Check,
  ChevronDown,
  Plus,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import * as React from "react";

import { cn } from "../../../lib/utils";
import { Badge } from "../../ui-shadcn/badge";
import { Button } from "../../ui-shadcn/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../ui-shadcn/card";
import { Input } from "../../ui-shadcn/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../ui-shadcn/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui-shadcn/select";
import { Separator } from "../../ui-shadcn/separator";
import { ToggleGroup, ToggleGroupItem } from "../../ui-shadcn/toggle-group";

export type FilterValue = string | number | boolean | null;

export type FilterOperator =
  | "is"
  | "is_not"
  | "contains"
  | "starts_with"
  | "ends_with"
  | "is_any_of"
  | "is_not_any_of"
  | "greater_than"
  | "less_than"
  | "between"
  | "is_empty"
  | "is_not_empty";

export type FilterOption<TValue extends FilterValue = string> = {
  value: TValue;
  label: string;
  icon?: React.ReactNode;
  className?: string;
};

export type Filter<TValue extends FilterValue = string> = {
  id: string;
  field: string;
  operator: FilterOperator | string;
  values: TValue[];
};

export type FilterFieldConfig<TValue extends FilterValue = string> = {
  key: string;
  label: string;
  type: "text" | "select" | "multiselect" | "custom" | "separator";
  icon?: React.ReactNode;
  options?: FilterOption<TValue>[];
  operators?: FilterOperator[];
  defaultOperator?: FilterOperator | string;
  placeholder?: string;
  searchable?: boolean;
  maxSelections?: number;
  prefix?: React.ReactNode | string;
  suffix?: React.ReactNode | string;
  pattern?: string;
  validation?: (
    value: TValue[],
  ) => boolean | { valid?: boolean; message?: string };
  customRenderer?: (props: {
    field: FilterFieldConfig<TValue>;
    value: TValue[];
    onChange: (value: TValue[]) => void;
    operator: FilterOperator | string;
    onOperatorChange: (operator: FilterOperator | string) => void;
    size: FiltersSize;
    i18n: FilterI18nConfig;
  }) => React.ReactNode;
  customValueRenderer?: (
    values: TValue[],
    options: FilterOption<TValue>[],
  ) => React.ReactNode;
  fields?: FilterFieldConfig<TValue>[];
  group?: string;
  className?: string;
};

export type FilterGroup<TValue extends FilterValue = string> = {
  id: string;
  label: string;
  fields: FilterFieldConfig<TValue>[];
  initialFilters?: Filter<TValue>[];
};

export type FilterI18nConfig = {
  addFilter: string;
  searchFields: string;
  chooseField: string;
  chooseOperator: string;
  valuePlaceholder: string;
  apply: string;
  cancel: string;
  remove: string;
  noFields: string;
  noResults: string;
  validation: {
    invalidValue: string;
    required: string;
  };
  operators: Partial<Record<FilterOperator, string>>;
  placeholders: Record<string, string>;
};

export type FiltersSize = "sm" | "default" | "lg";

export const defaultFilterI18n: FilterI18nConfig = {
  addFilter: "Add filter",
  searchFields: "Search fields",
  chooseField: "Choose a field",
  chooseOperator: "Operator",
  valuePlaceholder: "Enter a value",
  apply: "Apply filter",
  cancel: "Cancel",
  remove: "Remove",
  noFields: "No matching fields.",
  noResults: "No filters yet.",
  validation: {
    invalidValue: "The current value is not valid.",
    required: "This field is required.",
  },
  operators: {
    is: "is",
    is_not: "is not",
    contains: "contains",
    starts_with: "starts with",
    ends_with: "ends with",
    is_any_of: "is any of",
    is_not_any_of: "is not any of",
    greater_than: "greater than",
    less_than: "less than",
    between: "between",
    is_empty: "is empty",
    is_not_empty: "is not empty",
  },
  placeholders: {
    text: "Type to filter",
    select: "Choose a value",
    multiselect: "Choose one or more values",
    custom: "Configure custom value",
  },
};

const defaultOperatorByType: Record<
  Exclude<FilterFieldConfig["type"], "separator">,
  FilterOperator
> = {
  text: "contains",
  select: "is",
  multiselect: "is_any_of",
  custom: "is",
};

function createId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `filter-${Math.random().toString(36).slice(2, 10)}`;
}

export function createFilter<TValue extends FilterValue = string>(
  field: string,
  operator?: FilterOperator | string,
  values: TValue[] = [],
): Filter<TValue> {
  return {
    id: createId(),
    field,
    operator: operator ?? "contains",
    values,
  };
}

export function createFilterGroup<TValue extends FilterValue = string>(
  id: string,
  label: string,
  fields: FilterFieldConfig<TValue>[],
  initialFilters: Filter<TValue>[] = [],
): FilterGroup<TValue> {
  return {
    id,
    label,
    fields,
    initialFilters,
  };
}

function flattenFields<TValue extends FilterValue>(
  fields: FilterFieldConfig<TValue>[],
): FilterFieldConfig<TValue>[] {
  return fields.flatMap((field) =>
    field.fields?.length ? flattenFields(field.fields) : [field],
  );
}

function getOperatorLabel(
  operator: FilterOperator | string,
  i18n: FilterI18nConfig,
) {
  return i18n.operators[operator as FilterOperator] ?? operator;
}

function isValidationResult(
  result: boolean | { valid?: boolean; message?: string } | undefined,
): result is { valid?: boolean; message?: string } {
  return typeof result === "object" && result !== null;
}

function getFieldPlaceholder<TValue extends FilterValue>(
  field: FilterFieldConfig<TValue>,
  i18n: FilterI18nConfig,
) {
  return (
    field.placeholder ?? i18n.placeholders[field.type] ?? i18n.valuePlaceholder
  );
}

function describeFilterValue<TValue extends FilterValue>(
  filter: Filter<TValue>,
  field: FilterFieldConfig<TValue> | undefined,
  i18n: FilterI18nConfig,
) {
  if (!field) {
    return filter.values.join(", ");
  }

  if (field.customValueRenderer) {
    return field.customValueRenderer(filter.values, field.options ?? []);
  }

  if (filter.operator === "is_empty" || filter.operator === "is_not_empty") {
    return getOperatorLabel(filter.operator, i18n);
  }

  const labels = filter.values.map((value) => {
    const option = field.options?.find((item) => item.value === value);
    return option?.label ?? String(value);
  });

  return labels.join(", ");
}

function getFieldKey(field: FilterFieldConfig) {
  return field.key;
}

function collectFields<TValue extends FilterValue>(
  fields: FilterFieldConfig<TValue>[],
): FilterFieldConfig<TValue>[] {
  return flattenFields(fields).filter((field) => field.type !== "separator");
}

function getDefaultOperator<TValue extends FilterValue>(
  field: FilterFieldConfig<TValue>,
) {
  if (field.defaultOperator) {
    return field.defaultOperator;
  }

  return defaultOperatorByType[
    field.type as Exclude<typeof field.type, "separator">
  ];
}

function getFieldGroups<TValue extends FilterValue>(
  fields: FilterFieldConfig<TValue>[],
) {
  const groups: Array<{
    label: string;
    fields: FilterFieldConfig<TValue>[];
  }> = [];
  let currentGroup = "Fields";

  for (const field of fields) {
    if (field.type === "separator") {
      currentGroup = field.label;
      continue;
    }

    if (field.fields?.length) {
      groups.push({ label: field.group ?? field.label, fields: field.fields });
      continue;
    }

    const groupLabel = field.group ?? currentGroup;
    const existingGroup = groups.find((group) => group.label === groupLabel);

    if (existingGroup) {
      existingGroup.fields.push(field);
    } else {
      groups.push({ label: groupLabel, fields: [field] });
    }
  }

  return groups;
}

function sizeClasses(size: FiltersSize) {
  switch (size) {
    case "sm":
      return {
        button: "h-8 px-3 text-xs",
        input: "h-8 text-xs",
        badge: "h-7 px-2 text-xs",
        panel: "w-[20rem]",
      };
    case "lg":
      return {
        button: "h-10 px-4 text-sm",
        input: "h-10 text-sm",
        badge: "h-9 px-3 text-sm",
        panel: "w-[32rem]",
      };
    default:
      return {
        button: "h-9 px-3 text-sm",
        input: "h-9 text-sm",
        badge: "h-8 px-2.5 text-sm",
        panel: "w-[28rem]",
      };
  }
}

type FiltersProps<TValue extends FilterValue = string> = {
  filters: Filter<TValue>[];
  fields: FilterFieldConfig<TValue>[];
  onChange: (filters: Filter<TValue>[]) => void;
  size?: FiltersSize;
  trigger?: React.ReactNode;
  showSearchInput?: boolean;
  allowMultiple?: boolean;
  enableShortcut?: boolean;
  shortcutKey?: string;
  shortcutLabel?: string;
  i18n?: Partial<FilterI18nConfig>;
  className?: string;
  menuPopupClassName?: string;
};

function Filters<TValue extends FilterValue = string>({
  filters,
  fields,
  onChange,
  size = "default",
  trigger,
  showSearchInput = true,
  allowMultiple = true,
  enableShortcut = false,
  shortcutKey = "f",
  shortcutLabel = "F",
  i18n,
  className,
  menuPopupClassName,
}: FiltersProps<TValue>) {
  const labels = React.useMemo(
    () => ({
      ...defaultFilterI18n,
      ...i18n,
      validation: {
        ...defaultFilterI18n.validation,
        ...i18n?.validation,
      },
      operators: {
        ...defaultFilterI18n.operators,
        ...i18n?.operators,
      },
      placeholders: {
        ...defaultFilterI18n.placeholders,
        ...i18n?.placeholders,
      },
    }),
    [i18n],
  );

  const fieldList = React.useMemo(() => collectFields(fields), [fields]);
  const fieldGroups = React.useMemo(() => getFieldGroups(fields), [fields]);
  const fieldMap = React.useMemo(() => {
    return new Map(fieldList.map((field) => [field.key, field] as const));
  }, [fieldList]);

  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [activeFieldKey, setActiveFieldKey] = React.useState<string | null>(
    null,
  );
  const [draftOperator, setDraftOperator] = React.useState<
    FilterOperator | string
  >("contains");
  const [draftValues, setDraftValues] = React.useState<TValue[]>([]);
  const [validationMessage, setValidationMessage] = React.useState<
    string | null
  >(null);

  const classes = sizeClasses(size);

  const activeField = activeFieldKey ? fieldMap.get(activeFieldKey) : null;

  React.useEffect(() => {
    if (!enableShortcut) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      const key = shortcutKey.toLowerCase();
      const isShortcut =
        event.key.toLowerCase() === key && (event.metaKey || event.ctrlKey);

      if (!isShortcut) {
        return;
      }

      event.preventDefault();
      setOpen((current) => !current);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [enableShortcut, shortcutKey]);

  React.useEffect(() => {
    if (!open) {
      setQuery("");
      setActiveFieldKey(null);
      setValidationMessage(null);
      return;
    }

    if (!activeFieldKey && fieldList[0]) {
      setActiveFieldKey(fieldList[0].key);
      setDraftOperator(getDefaultOperator(fieldList[0]));
      setDraftValues(
        fieldList[0].type === "multiselect" ? [] : ([""] as TValue[]),
      );
    }
  }, [activeFieldKey, fieldList, open]);

  React.useEffect(() => {
    if (!activeField) {
      return;
    }

    setDraftOperator((current) =>
      current && activeField.operators?.includes(current as FilterOperator)
        ? current
        : getDefaultOperator(activeField),
    );

    if (!draftValues.length) {
      if (activeField.type === "multiselect") {
        setDraftValues([]);
      } else if (activeField.type === "select" && activeField.options?.[0]) {
        setDraftValues([activeField.options[0].value]);
      } else if (activeField.type === "text") {
        setDraftValues(["" as TValue]);
      } else {
        setDraftValues([] as TValue[]);
      }
    }
  }, [activeField, draftValues.length]);

  const existingFieldKeys = React.useMemo(() => {
    return new Set(filters.map((filter) => filter.field));
  }, [filters]);

  const visibleFieldGroups = React.useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return fieldGroups
      .map((group) => ({
        ...group,
        fields: group.fields.filter((field) => {
          if (field.type === "separator") {
            return false;
          }

          if (!normalizedQuery) {
            return true;
          }

          return (
            field.label.toLowerCase().includes(normalizedQuery) ||
            field.key.toLowerCase().includes(normalizedQuery) ||
            (field.group ?? "").toLowerCase().includes(normalizedQuery)
          );
        }),
      }))
      .filter((group) => group.fields.length > 0);
  }, [fieldGroups, query]);

  const canAddField = React.useMemo(() => {
    if (!activeField) {
      return false;
    }

    if (allowMultiple) {
      return true;
    }

    return !existingFieldKeys.has(activeField.key);
  }, [activeField, allowMultiple, existingFieldKeys]);

  const resetDraft = React.useCallback((field?: FilterFieldConfig<TValue>) => {
    const nextField = field ?? null;

    setActiveFieldKey(nextField?.key ?? null);
    setDraftOperator(nextField ? getDefaultOperator(nextField) : "contains");
    setDraftValues(
      nextField?.type === "select" && nextField.options?.[0]
        ? [nextField.options[0].value]
        : nextField?.type === "multiselect"
          ? []
          : nextField?.type === "text"
            ? (["" as TValue] as TValue[])
            : ([] as TValue[]),
    );
    setValidationMessage(null);
  }, []);

  const commitFilter = React.useCallback(() => {
    if (!activeField) {
      return;
    }

    if (!canAddField) {
      setValidationMessage(`${activeField.label} is already active.`);
      return;
    }

    const nextValidation = activeField.validation?.(draftValues);
    const isValid =
      typeof nextValidation === "boolean"
        ? nextValidation
        : (nextValidation?.valid ?? true);

    if (!isValid) {
      setValidationMessage(
        isValidationResult(nextValidation) && nextValidation.message
          ? nextValidation.message
          : labels.validation.invalidValue,
      );
      return;
    }

    if (
      (draftValues.length === 0 ||
        draftValues.every((value) => value === "")) &&
      activeField.type !== "custom" &&
      draftOperator !== "is_empty" &&
      draftOperator !== "is_not_empty"
    ) {
      setValidationMessage(labels.validation.required);
      return;
    }

    const nextFilter = createFilter<TValue>(
      activeField.key,
      draftOperator,
      draftValues,
    );

    onChange([...filters, nextFilter]);
    setOpen(false);
    resetDraft();
  }, [
    activeField,
    canAddField,
    draftOperator,
    draftValues,
    filters,
    labels.validation.invalidValue,
    labels.validation.required,
    onChange,
    resetDraft,
  ]);

  const removeFilter = React.useCallback(
    (id: string) => {
      onChange(filters.filter((filter) => filter.id !== id));
    },
    [filters, onChange],
  );

  const defaultTrigger = (
    <Button
      variant="outline"
      size={size === "sm" ? "xs" : size === "lg" ? "default" : "sm"}
      className={cn("gap-2", classes.button)}
    >
      <SlidersHorizontal data-icon="inline-start" />
      {labels.addFilter}
      {enableShortcut ? (
        <span className="text-muted-foreground text-[10px] uppercase tracking-[0.2em]">
          {shortcutLabel}
        </span>
      ) : null}
    </Button>
  );
  const triggerElement = React.isValidElement(trigger)
    ? trigger
    : defaultTrigger;

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <div className="flex flex-wrap gap-2">
        {filters.length ? (
          filters.map((filter) => {
            const field = fieldMap.get(filter.field);

            return (
              <Badge
                key={filter.id}
                variant="secondary"
                className={cn(
                  "inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/60",
                  classes.badge,
                )}
              >
                <span className="max-w-[12rem] truncate">
                  <span className="font-medium">
                    {field?.label ?? filter.field}
                  </span>
                  <span className="text-muted-foreground">
                    {" "}
                    {getOperatorLabel(filter.operator, labels)}
                  </span>
                  <span className="text-foreground/80">
                    {" "}
                    {describeFilterValue(filter, field, labels)}
                  </span>
                </span>
                <Button
                  variant="ghost"
                  size="icon-xs"
                  className="rounded-full"
                  onClick={() => removeFilter(filter.id)}
                  aria-label={`${labels.remove} ${field?.label ?? filter.field}`}
                >
                  <X data-icon="inline-start" />
                </Button>
              </Badge>
            );
          })
        ) : (
          <div className="text-muted-foreground text-sm">
            {labels.noResults}
          </div>
        )}
      </div>

      <Popover
        open={open}
        onOpenChange={(nextOpen) => {
          setOpen(nextOpen);
          if (!nextOpen) {
            resetDraft();
          }
        }}
      >
        <PopoverTrigger asChild>
          {trigger ? triggerElement : defaultTrigger}
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className={cn("p-0", classes.panel, menuPopupClassName)}
        >
          <div className="flex items-center justify-between gap-3 border-b px-4 py-3">
            <div className="flex flex-col gap-0.5">
              <div className="flex items-center gap-2 font-medium">
                <SlidersHorizontal className="size-4 text-muted-foreground" />
                {labels.addFilter}
              </div>
              <p className="text-muted-foreground text-xs">
                {filters.length} active
              </p>
            </div>
            {enableShortcut ? (
              <Badge variant="outline" className="rounded-full">
                {shortcutLabel}
              </Badge>
            ) : null}
          </div>

          <div className="grid gap-3 p-4">
            {showSearchInput ? (
              <div className="relative">
                <Search className="pointer-events-none absolute top-2.5 left-3 size-4 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder={labels.searchFields}
                  className={cn("pl-9", classes.input)}
                />
              </div>
            ) : null}

            {!activeField ? (
              <div className="grid gap-3">
                {visibleFieldGroups.length ? (
                  visibleFieldGroups.map((group) => (
                    <div key={group.label} className="grid gap-2">
                      <div className="text-muted-foreground text-xs uppercase tracking-[0.2em]">
                        {group.label}
                      </div>
                      <div className="grid gap-2">
                        {group.fields.map((field) => {
                          const disabled =
                            !allowMultiple && existingFieldKeys.has(field.key);

                          return (
                            <button
                              key={field.key}
                              type="button"
                              onClick={() => {
                                setActiveFieldKey(field.key);
                                setDraftOperator(getDefaultOperator(field));
                                if (
                                  field.type === "select" &&
                                  field.options?.[0]
                                ) {
                                  setDraftValues([field.options[0].value]);
                                } else if (field.type === "multiselect") {
                                  setDraftValues([]);
                                } else if (field.type === "text") {
                                  setDraftValues(["" as TValue]);
                                } else {
                                  setDraftValues([] as TValue[]);
                                }
                                setValidationMessage(null);
                              }}
                              disabled={disabled}
                              className={cn(
                                "flex items-center justify-between rounded-md border px-3 py-2 text-left text-sm transition-colors",
                                "hover:bg-accent hover:text-accent-foreground disabled:cursor-not-allowed disabled:opacity-50",
                              )}
                            >
                              <span className="flex items-center gap-2">
                                {field.icon ? (
                                  <span className="text-muted-foreground">
                                    {field.icon}
                                  </span>
                                ) : null}
                                <span>{field.label}</span>
                              </span>
                              <span className="text-muted-foreground text-xs">
                                {field.type}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-muted-foreground py-6 text-center text-sm">
                    {labels.noFields}
                  </div>
                )}
              </div>
            ) : (
              <div className="grid gap-3">
                <div className="flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => resetDraft()}
                    className="text-muted-foreground text-xs hover:text-foreground"
                  >
                    ← Back
                  </button>
                  <div className="text-sm font-medium">{activeField.label}</div>
                </div>

                <div className="grid gap-2">
                  <div className="text-muted-foreground text-xs uppercase tracking-[0.2em]">
                    {labels.chooseOperator}
                  </div>
                  <Select
                    value={draftOperator}
                    onValueChange={(value) => setDraftOperator(value)}
                  >
                    <SelectTrigger size={size === "sm" ? "sm" : "default"}>
                      <SelectValue placeholder={labels.chooseOperator} />
                    </SelectTrigger>
                    <SelectContent>
                      {(activeField.operators?.length
                        ? activeField.operators
                        : Object.keys(labels.operators)
                      )?.map((operator) => (
                        <SelectItem key={operator} value={operator}>
                          {getOperatorLabel(operator, labels)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <div className="text-muted-foreground text-xs uppercase tracking-[0.2em]">
                    {activeField.label}
                  </div>

                  {activeField.customRenderer ? (
                    activeField.customRenderer({
                      field: activeField,
                      value: draftValues,
                      onChange: setDraftValues,
                      operator: draftOperator,
                      onOperatorChange: setDraftOperator,
                      size,
                      i18n: labels,
                    })
                  ) : activeField.type === "text" ? (
                    <Input
                      value={String(draftValues[0] ?? "")}
                      placeholder={getFieldPlaceholder(activeField, labels)}
                      onChange={(event) =>
                        setDraftValues([event.target.value as TValue])
                      }
                      pattern={activeField.pattern}
                      className={classes.input}
                    />
                  ) : activeField.type === "select" ? (
                    <Select
                      value={String(draftValues[0] ?? "")}
                      onValueChange={(value) =>
                        setDraftValues([value as TValue])
                      }
                    >
                      <SelectTrigger size={size === "sm" ? "sm" : "default"}>
                        <SelectValue
                          placeholder={getFieldPlaceholder(activeField, labels)}
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {activeField.options?.map((option) => (
                          <SelectItem
                            key={String(option.value)}
                            value={String(option.value)}
                          >
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : activeField.type === "multiselect" ? (
                    <div className="grid gap-2">
                      <ToggleGroup
                        type="multiple"
                        value={draftValues.map(String)}
                        onValueChange={(values) =>
                          setDraftValues(values.map((value) => value as TValue))
                        }
                        variant="outline"
                        size={size === "sm" ? "sm" : "default"}
                        spacing={6}
                        className="w-full flex-wrap justify-start"
                      >
                        {activeField.options?.map((option) => (
                          <ToggleGroupItem
                            key={String(option.value)}
                            value={String(option.value)}
                          >
                            {option.label}
                          </ToggleGroupItem>
                        ))}
                      </ToggleGroup>
                      {activeField.searchable ? (
                        <p className="text-muted-foreground text-xs">
                          {getFieldPlaceholder(activeField, labels)}
                        </p>
                      ) : null}
                    </div>
                  ) : activeField.type === "custom" &&
                    activeField.customRenderer ? (
                    <div className="rounded-md border bg-muted/30 p-3 text-sm">
                      {(
                        activeField.customRenderer as NonNullable<
                          FilterFieldConfig<TValue>["customRenderer"]
                        >
                      )({
                        field: activeField,
                        value: draftValues,
                        onChange: setDraftValues,
                        operator: draftOperator,
                        onOperatorChange: setDraftOperator,
                        size,
                        i18n: labels,
                      })}
                    </div>
                  ) : (
                    <div className="rounded-md border bg-muted/30 p-3 text-sm">
                      <span className="text-muted-foreground">
                        {getFieldPlaceholder(activeField, labels)}
                      </span>
                    </div>
                  )}
                </div>

                {validationMessage ? (
                  <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-destructive text-xs">
                    {validationMessage}
                  </div>
                ) : null}

                <Separator />

                <div className="flex items-center justify-end gap-2">
                  <Button
                    variant="outline"
                    size={size === "sm" ? "xs" : "sm"}
                    onClick={() => {
                      setOpen(false);
                      resetDraft();
                    }}
                  >
                    {labels.cancel}
                  </Button>
                  <Button
                    size={size === "sm" ? "xs" : "sm"}
                    onClick={commitFilter}
                    disabled={!canAddField}
                  >
                    <Plus data-icon="inline-start" />
                    {labels.apply}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

function FiltersPatternCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

export {
  Check,
  ChevronDown,
  Filters,
  FiltersPatternCard,
  getDefaultOperator,
  getFieldKey,
  getFieldPlaceholder,
  getOperatorLabel,
  Plus,
  Search,
  SlidersHorizontal,
  sizeClasses,
  X,
};
