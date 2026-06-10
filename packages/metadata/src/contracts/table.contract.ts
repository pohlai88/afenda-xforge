import type {
  MetadataTableColumnCustomizationPolicy,
  MetadataTableCustomizationPolicy,
} from "./customization-policy.contract.ts";
import type { MetadataNodeId } from "./id.contract.ts";

export type MetadataTableColumn = {
  align?: "center" | "end" | "start";
  customization?: MetadataTableColumnCustomizationPolicy;
  field: string;
  filterable?: boolean;
  id?: MetadataNodeId;
  key: string;
  label: string;
  sortable?: boolean;
  width?: "auto" | "lg" | "md" | "sm";
};

export type MetadataTableContract = {
  columns: readonly MetadataTableColumn[];
  customization?: MetadataTableCustomizationPolicy;
  id?: MetadataNodeId;
  key: string;
  supports: {
    emptyState: true;
    filtering: true;
    pagination: true;
    permissionAwareActions: true;
    rowActions: true;
    sorting: true;
  };
  title: string;
};
