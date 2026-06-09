import type { MetadataId } from "@repo/metadata";

export type CustomizationScope = "company" | "tenant";

export type CustomizationStatus = "archived" | "draft" | "published";

export type CustomizationActorMetadata = {
  at: string;
  by: string;
};

export type CustomizationLifecycleContract = {
  archived?: CustomizationActorMetadata;
  baseMetadataFingerprint?: string;
  created?: CustomizationActorMetadata;
  published?: CustomizationActorMetadata;
  status?: CustomizationStatus;
  updated?: CustomizationActorMetadata;
  version?: number;
};

export type CustomizationPresentationContract = {
  density?: "comfortable" | "compact" | "default";
  icon?: string;
  size?: "icon" | "lg" | "md" | "sm";
  tone?: "destructive" | "info" | "neutral" | "success" | "warning";
  variant?:
    | "default"
    | "destructive"
    | "ghost"
    | "info"
    | "link"
    | "muted"
    | "outline"
    | "secondary"
    | "success"
    | "warning";
};

export type CustomizationFieldOverrideContract = {
  description?: string;
  hidden?: boolean;
  key: string;
  label?: string;
  order?: number;
  placeholder?: string;
};

export type CustomizationSectionOverrideContract = {
  columns?: 1 | 2 | 3 | 4;
  description?: string;
  fieldKeys?: readonly string[];
  hidden?: boolean;
  key: string;
  label?: string;
};

export type CustomizationFormOverrideContract = {
  hidden?: boolean;
  key: string;
  label?: string;
  layout?: "grid" | "inline" | "stack";
  sectionKeys?: readonly string[];
};

export type CustomizationTableColumnOverrideContract = {
  align?: "center" | "end" | "start";
  field?: string;
  hidden?: boolean;
  key: string;
  label?: string;
  order?: number;
  width?: "auto" | "lg" | "md" | "sm";
};

export type CustomizationTableOverrideContract = {
  columns?: readonly CustomizationTableColumnOverrideContract[];
  hidden?: boolean;
  key: string;
  title?: string;
};

export type CustomizationEntityTableOverrideContract = {
  columns?: readonly CustomizationTableColumnOverrideContract[];
  defaultSort?: string;
  title?: string;
};

export type CustomizationFilterOverrideContract = {
  hidden?: boolean;
  key: string;
  label?: string;
};

export type CustomizationActionOverrideContract = {
  hidden?: boolean;
  key: string;
  label?: string;
  placement?: "overflow" | "primary" | "row" | "secondary";
};

export type CustomizationContract = {
  actions?: readonly CustomizationActionOverrideContract[];
  archived?: CustomizationActorMetadata;
  baseMetadataFingerprint?: string;
  companyId?: string;
  created?: CustomizationActorMetadata;
  description?: string;
  entity: string;
  featureId: MetadataId;
  fields?: readonly CustomizationFieldOverrideContract[];
  filters?: readonly CustomizationFilterOverrideContract[];
  forms?: readonly CustomizationFormOverrideContract[];
  id: MetadataId;
  presentation?: CustomizationPresentationContract;
  published?: CustomizationActorMetadata;
  sections?: readonly CustomizationSectionOverrideContract[];
  scope: CustomizationScope;
  status?: CustomizationStatus;
  table?: CustomizationEntityTableOverrideContract;
  tables?: readonly CustomizationTableOverrideContract[];
  tenantId: string;
  title?: string;
  updated?: CustomizationActorMetadata;
  version?: number;
};

export type CustomizationLookupContract = {
  companyId?: string;
  entity: string;
  featureId: MetadataId;
  scope?: CustomizationScope;
  tenantId: string;
};

export type CustomizationVersionLookupContract = CustomizationLookupContract & {
  version: number;
};

export type SaveCustomizationDraftInput = {
  customization: CustomizationContract;
};

export type PublishCustomizationInput = CustomizationVersionLookupContract & {
  actorId: string;
};

export type ArchiveCustomizationInput = CustomizationVersionLookupContract & {
  actorId: string;
};

export type CustomizationRepositoryContract = {
  archiveCustomization: (
    input: ArchiveCustomizationInput
  ) => Promise<CustomizationContract>;
  getPublishedCustomization: (
    lookup: CustomizationLookupContract
  ) => Promise<CustomizationContract | null>;
  getCustomizationVersion: (
    lookup: CustomizationVersionLookupContract
  ) => Promise<CustomizationContract | null>;
  listCustomizationVersions: (
    lookup: CustomizationLookupContract
  ) => Promise<readonly CustomizationContract[]>;
  publishCustomization: (
    input: PublishCustomizationInput
  ) => Promise<CustomizationContract>;
  saveDraftCustomization: (
    input: SaveCustomizationDraftInput
  ) => Promise<CustomizationContract>;
};

export const customizationAuditOperations = [
  "customization.draft.created",
  "customization.draft.updated",
  "customization.validated",
  "customization.published",
  "customization.archived",
  "customization.rollback.requested",
  "customization.rollback.published",
  "customization.import.attempted",
  "customization.export.generated",
] as const;

export type CustomizationAuditOperation =
  (typeof customizationAuditOperations)[number];

export type CustomizationAuditDescriptor = {
  actorId: string;
  companyId?: string;
  customizationId: MetadataId;
  entity: string;
  featureId: MetadataId;
  operation: CustomizationAuditOperation;
  reason?: string;
  result: "failure" | "success";
  tenantId: string;
  version?: number;
};

export type CustomizationFixtureContract = {
  exportedAt: string;
  exportedBy: string;
  schemaVersion: 1;
  customization: CustomizationContract;
};
