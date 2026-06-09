export const metadataKinds = [
  "action",
  "feature",
  "field",
  "filter",
  "form",
  "presentation",
  "section",
  "state",
  "table",
] as const;

export type MetadataKind = (typeof metadataKinds)[number];
