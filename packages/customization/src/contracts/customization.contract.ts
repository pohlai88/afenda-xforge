import type { MetadataId } from "@repo/metadata";

export type CustomizationScope = "company" | "tenant";

export type CustomizationStatus = "archived" | "draft" | "published";

export type CustomizationActorMetadata = {
  at: string;
  by: string;
};

export type CustomizationRollbackMetadata = CustomizationActorMetadata & {
  fromVersion: number;
};

export type CustomizationLifecycleContract = {
  archived?: CustomizationActorMetadata;
  baseMetadataFingerprint?: string;
  created?: CustomizationActorMetadata;
  published?: CustomizationActorMetadata;
  rolledBack?: CustomizationRollbackMetadata;
  status?: CustomizationStatus;
  updated?: CustomizationActorMetadata;
  version?: number;
};

export const customizationValidationIssueCodes = [
  "customization.company_scope_not_allowed",
  "customization.entity_mismatch",
  "customization.entity_table_not_supported",
  "customization.feature_mismatch",
  "customization.hidden_required_field",
  "customization.hidden_system_field",
  "customization.invalid_default_sort",
  "customization.override_not_allowed",
  "customization.stale_metadata",
  "customization.unknown_key",
  "customization.unknown_reference",
  "customization.unsafe_action",
] as const;

export type CustomizationValidationIssueCode =
  (typeof customizationValidationIssueCodes)[number];

export type CustomizationValidationSeverity = "error" | "warning";

export type CustomizationValidationMode =
  | "import-draft"
  | "import-strict"
  | "preview"
  | "publish"
  | "runtime";

export type CustomizationValidationIssue = {
  code: CustomizationValidationIssueCode;
  hint?: string;
  message: string;
  path: readonly (number | string)[];
  severity: CustomizationValidationSeverity;
};

export type CustomizationValidationResult = {
  issues: readonly CustomizationValidationIssue[];
  valid: boolean;
  validationMode: CustomizationValidationMode;
};

export type CustomizationImportMode = "draft-with-warnings" | "strict";

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

export type CustomizationContract = CustomizationLifecycleContract & {
  actions?: readonly CustomizationActionOverrideContract[];
  companyId?: string;
  description?: string;
  entity: string;
  featureId: MetadataId;
  fields?: readonly CustomizationFieldOverrideContract[];
  filters?: readonly CustomizationFilterOverrideContract[];
  forms?: readonly CustomizationFormOverrideContract[];
  id: MetadataId;
  presentation?: CustomizationPresentationContract;
  sections?: readonly CustomizationSectionOverrideContract[];
  scope: CustomizationScope;
  table?: CustomizationEntityTableOverrideContract;
  tables?: readonly CustomizationTableOverrideContract[];
  tenantId: string;
  title?: string;
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

export type RollbackCustomizationInput = CustomizationVersionLookupContract & {
  actorId: string;
  fromVersion: number;
};

export type CustomizationRuntimeLookupContract = CustomizationLookupContract & {
  metadataFingerprint?: string;
};

export type CustomizationPreviewLookupContract =
  CustomizationRuntimeLookupContract & {
    includeDrafts: true;
  };

export type ImportCustomizationDraftInput = {
  actorId: string;
  fixture: CustomizationFixtureContract;
  mode: CustomizationImportMode;
};

export type ExportCustomizationVersionInput =
  CustomizationVersionLookupContract;

export type CustomizationLayerLoadContract = {
  company?: CustomizationContract | null;
  tenant?: CustomizationContract | null;
};

export type CustomizationImportReviewContract = {
  customization: CustomizationContract;
  issues: readonly CustomizationValidationIssue[];
  mode: CustomizationImportMode;
  publishable: boolean;
  requiresReview: boolean;
  valid: boolean;
};

export type CustomizationResolutionStatus = "base_fallback" | "resolved";

export type CustomizationResolutionResult<TMetadata> = {
  appliedCustomizations: readonly CustomizationContract[];
  diagnostics: readonly CustomizationValidationIssue[];
  metadata: TMetadata;
  status: CustomizationResolutionStatus;
};

export type CustomizationRepositoryContract = {
  archiveCustomization: (
    input: ArchiveCustomizationInput
  ) => Promise<CustomizationContract>;
  exportCustomizationVersion: (
    input: ExportCustomizationVersionInput
  ) => Promise<CustomizationFixtureContract>;
  getPublishedCustomization: (
    lookup: CustomizationLookupContract
  ) => Promise<CustomizationContract | null>;
  getPublishedCustomizationLayers: (
    lookup: CustomizationRuntimeLookupContract
  ) => Promise<CustomizationLayerLoadContract>;
  getCustomizationVersion: (
    lookup: CustomizationVersionLookupContract
  ) => Promise<CustomizationContract | null>;
  getPreviewCustomizationLayers: (
    lookup: CustomizationPreviewLookupContract
  ) => Promise<CustomizationLayerLoadContract>;
  importCustomizationDraft: (
    input: ImportCustomizationDraftInput
  ) => Promise<CustomizationImportReviewContract>;
  listCustomizationVersions: (
    lookup: CustomizationLookupContract
  ) => Promise<readonly CustomizationContract[]>;
  publishCustomization: (
    input: PublishCustomizationInput
  ) => Promise<CustomizationContract>;
  rollbackCustomization: (
    input: RollbackCustomizationInput
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
