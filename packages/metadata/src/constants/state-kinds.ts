export const metadataStateKinds = [
  "loading",
  "empty",
  "error",
  "forbidden",
  "ready",
] as const;

export type MetadataStateKind = (typeof metadataStateKinds)[number];
