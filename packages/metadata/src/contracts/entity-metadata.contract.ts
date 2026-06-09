import type { MetadataActionContract } from "./action.contract.ts";
import type { MetadataFieldContract } from "./field.contract.ts";
import type { MetadataFilterContract } from "./filter.contract.ts";
import type { MetadataFormContract } from "./form.contract.ts";
import type { MetadataPermissionHint } from "./permission-hint.contract.ts";
import type { MetadataPresentationContract } from "./presentation.contract.ts";
import type { MetadataSectionContract } from "./section.contract.ts";
import type { MetadataStateContract } from "./state.contract.ts";

type EntityMetadataColumnKind = "date" | "email" | "money" | "status" | "text";

type EntityMetadataTableColumn = {
  align?: "center" | "end" | "start";
  description?: string;
  field?: string;
  key: string;
  label: string;
  kind?: EntityMetadataColumnKind;
  filterable?: boolean;
  sortable?: boolean;
  width?: "auto" | "lg" | "md" | "sm";
};

export type EntityLabels = {
  plural: string;
  singular: string;
};

export type EntityTableMetadata = {
  columns: readonly EntityMetadataTableColumn[];
  defaultSort: string;
  title?: string;
};

export type EntityMetadata = {
  actions?: readonly MetadataActionContract[];
  description?: string;
  entity: string;
  fields?: readonly MetadataFieldContract[];
  filters?: readonly MetadataFilterContract[];
  forms?: readonly MetadataFormContract[];
  id?: string;
  labels: EntityLabels;
  permissionHint?: MetadataPermissionHint;
  presentation?: MetadataPresentationContract;
  sections?: readonly MetadataSectionContract[];
  states?: readonly MetadataStateContract[];
  table?: EntityTableMetadata;
  tables?: readonly EntityTableMetadata[];
  title?: string;
};
