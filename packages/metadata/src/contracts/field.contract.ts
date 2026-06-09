import type { MetadataFieldKind } from "../constants/field-kinds.ts";
import type { MetadataFieldCustomizationPolicy } from "./customization-policy.contract.ts";

export type MetadataFieldContract = {
  customization?: MetadataFieldCustomizationPolicy;
  description?: string;
  kind: MetadataFieldKind;
  key: string;
  label: string;
  permissionHint?: string;
  placeholder?: string;
  required?: boolean;
  validationHint?: string;
};
