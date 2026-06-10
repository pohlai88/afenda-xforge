import type { MetadataFilterCustomizationPolicy } from "./customization-policy.contract.ts";
import type { MetadataNodeId } from "./id.contract.ts";

export type MetadataFilterKind =
  | "boolean"
  | "date"
  | "datetime"
  | "money"
  | "multiselect"
  | "number"
  | "select"
  | "status"
  | "text";

export type MetadataFilterOperator =
  | "between"
  | "contains"
  | "endsWith"
  | "equals"
  | "greaterThan"
  | "greaterThanOrEqual"
  | "in"
  | "lessThan"
  | "lessThanOrEqual"
  | "startsWith";

export type MetadataFilterOption = {
  disabled?: boolean;
  label: string;
  value: boolean | number | string;
};

export type MetadataFilterContract = {
  customization?: MetadataFilterCustomizationPolicy;
  description?: string;
  field: string;
  id?: MetadataNodeId;
  kind: MetadataFilterKind;
  key: string;
  label: string;
  operator?: MetadataFilterOperator;
  options?: readonly MetadataFilterOption[];
  permissionHint?: string;
  placeholder?: string;
};
