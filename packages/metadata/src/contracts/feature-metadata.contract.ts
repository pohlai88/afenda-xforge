import type { MetadataActionContract } from "./action.contract.ts";
import type { MetadataFieldContract } from "./field.contract.ts";
import type { MetadataFilterContract } from "./filter.contract.ts";
import type { MetadataFormContract } from "./form.contract.ts";
import type { MetadataId } from "./id.contract.ts";
import type { MetadataPermissionHint } from "./permission-hint.contract.ts";
import type { MetadataPresentationContract } from "./presentation.contract.ts";
import type { MetadataSectionContract } from "./section.contract.ts";
import type { MetadataStateContract } from "./state.contract.ts";
import type { MetadataTableContract } from "./table.contract.ts";

export type MetadataLabelsContract = {
  plural: string;
  singular: string;
};

export type MetadataFeatureContract = {
  actions?: readonly MetadataActionContract[];
  description?: string;
  entity: string;
  fields?: readonly MetadataFieldContract[];
  filters?: readonly MetadataFilterContract[];
  forms?: readonly MetadataFormContract[];
  id: MetadataId;
  labels: MetadataLabelsContract;
  permissionHint?: MetadataPermissionHint;
  presentation?: MetadataPresentationContract;
  sections?: readonly MetadataSectionContract[];
  states?: readonly MetadataStateContract[];
  tables?: readonly MetadataTableContract[];
  title?: string;
};
