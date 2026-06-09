import type { MetadataFieldKind } from "../constants/field-kinds.ts";

export type MetadataFieldContract = {
  description?: string;
  kind: MetadataFieldKind;
  key: string;
  label: string;
  permissionHint?: string;
  placeholder?: string;
  required?: boolean;
  validationHint?: string;
};
