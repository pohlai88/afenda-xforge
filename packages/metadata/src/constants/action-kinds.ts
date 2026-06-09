export const metadataActionKinds = [
  "approve",
  "archive",
  "create",
  "custom",
  "delete",
  "reject",
  "restore",
  "submit",
  "update",
] as const;

export type MetadataActionKind = (typeof metadataActionKinds)[number];
