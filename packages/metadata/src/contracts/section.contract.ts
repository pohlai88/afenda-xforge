import type { MetadataSectionCustomizationPolicy } from "./customization-policy.contract.ts";
import type { MetadataNodeId } from "./id.contract.ts";

export type MetadataSectionColumns = 1 | 2 | 3 | 4;

export type MetadataSectionContract = {
  collapsible?: boolean;
  columns?: MetadataSectionColumns;
  customization?: MetadataSectionCustomizationPolicy;
  description?: string;
  fieldKeys: readonly string[];
  id?: MetadataNodeId;
  key: string;
  label: string;
  permissionHint?: string;
};
