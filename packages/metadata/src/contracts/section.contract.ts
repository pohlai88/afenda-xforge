export type MetadataSectionColumns = 1 | 2 | 3 | 4;

export type MetadataSectionContract = {
  collapsible?: boolean;
  columns?: MetadataSectionColumns;
  description?: string;
  fieldKeys: readonly string[];
  key: string;
  label: string;
  permissionHint?: string;
};
