export type MetadataTableColumn = {
  align?: "center" | "end" | "start";
  field: string;
  filterable?: boolean;
  key: string;
  label: string;
  sortable?: boolean;
  width?: "auto" | "lg" | "md" | "sm";
};

export type MetadataTableContract = {
  columns: readonly MetadataTableColumn[];
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
