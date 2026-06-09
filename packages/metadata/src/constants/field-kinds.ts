export const metadataFieldKinds = [
  "text",
  "textarea",
  "number",
  "money",
  "date",
  "datetime",
  "select",
  "checkbox",
  "switch",
] as const;

export type MetadataFieldKind = (typeof metadataFieldKinds)[number];
