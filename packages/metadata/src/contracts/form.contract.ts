import type { MetadataFormCustomizationPolicy } from "./customization-policy.contract.ts";

export type MetadataFormLayout = "grid" | "inline" | "stack";

export type MetadataFormContract = {
  cancelActionKey?: string;
  customization?: MetadataFormCustomizationPolicy;
  description?: string;
  fieldKeys: readonly string[];
  key: string;
  label: string;
  layout?: MetadataFormLayout;
  permissionHint?: string;
  sectionKeys?: readonly string[];
  submitActionKey?: string;
};
