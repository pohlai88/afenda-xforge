import type {
  EntityMetadata,
  EntityTableMetadata,
  MetadataFeatureContract,
  MetadataTableContract,
} from "@repo/metadata";

import type {
  CustomizationContract,
  CustomizationValidationIssue,
  CustomizationValidationIssueCode,
  CustomizationValidationMode,
  CustomizationValidationResult,
} from "../contracts/customization.contract.ts";
import {
  buildMetadataNodeIndex,
  resolveMetadataNodeTarget,
} from "../internal/metadata-node-resolution.ts";

export type CustomizationMetadataValidationOptions = {
  allowStaleMetadataFingerprint?: boolean;
  companyAware?: boolean;
  metadataFingerprint?: string;
  rejectUnsupportedMetadataSurfaces?: boolean;
  validationMode?: CustomizationValidationMode;
};

type CustomizableMetadata = EntityMetadata | MetadataFeatureContract;

type Keyed = {
  id?: string;
  key: string;
};

type MetadataKeySets = {
  actionKeys: Set<string>;
  fieldKeys: Set<string>;
  filterKeys: Set<string>;
  formKeys: Set<string>;
  sectionKeys: Set<string>;
  tableKeys: Set<string>;
};

type FeatureTableOverride = NonNullable<
  CustomizationContract["tables"]
>[number];
type EntityTableColumnOverride = NonNullable<
  NonNullable<CustomizationContract["table"]>["columns"]
>[number];
type SortableMetadataColumn = {
  field?: string;
  key: string;
  sortable?: boolean;
};

type OverridePolicyContext = {
  hint?: string;
  label: string;
  path: readonly (number | string)[];
};

type IssueMetadata = Pick<
  CustomizationValidationIssue,
  | "metadataNodeId"
  | "metadataNodeKey"
  | "surface"
  | "targetNodeId"
  | "targetNodeKey"
>;

const defaultPolicyHint =
  "Declare the override in metadata customization policy before publishing this customization.";

const addIssue = (
  issues: CustomizationValidationIssue[],
  code: CustomizationValidationIssueCode,
  message: string,
  path: readonly (number | string)[],
  severity: CustomizationValidationIssue["severity"] = "error",
  hint?: string,
  metadata: Partial<IssueMetadata> = {}
): void => {
  issues.push({
    code,
    hint,
    ...metadata,
    message,
    path,
    severity,
  });
};

const keyedSet = (items: readonly Keyed[] | undefined): Set<string> =>
  new Set((items ?? []).map((item) => item.key));

const resolveOverrideTarget = <MetadataNode extends Keyed>(
  issues: CustomizationValidationIssue[],
  override: Keyed,
  index: ReturnType<typeof buildMetadataNodeIndex<MetadataNode>>,
  path: readonly (number | string)[],
  surface: string,
  label: string,
  emitDriftWarning = true
): MetadataNode | undefined => {
  const resolvedTarget = resolveMetadataNodeTarget(override, index);

  if (!resolvedTarget) {
    if (override.id) {
      addIssue(
        issues,
        "customization.node_removed",
        `${label} override id "${override.id}" does not exist in metadata`,
        [...path, "id"],
        "error",
        "Rebind the customization to a live metadata node id before publishing.",
        {
          surface,
          targetNodeId: override.id,
          targetNodeKey: override.key,
        }
      );
      return;
    }

    addIssue(
      issues,
      "customization.unknown_key",
      `${label} override key "${override.key}" does not exist in metadata`,
      [...path, "key"],
      "error",
      "Update the customization to target an existing metadata key.",
      {
        surface,
        targetNodeKey: override.key,
      }
    );
    return;
  }

  if (emitDriftWarning && resolvedTarget.driftedKey) {
    addIssue(
      issues,
      "customization.node_renamed",
      `${label} override key "${override.key}" is stale; metadata now uses "${resolvedTarget.metadataNode.key}"`,
      [...path, "key"],
      "warning",
      "Refresh the customization payload so it uses the current canonical metadata key before publishing.",
      {
        metadataNodeId: resolvedTarget.canonicalId,
        metadataNodeKey: resolvedTarget.metadataNode.key,
        surface,
        targetNodeId: override.id,
        targetNodeKey: override.key,
      }
    );
  }

  return resolvedTarget.metadataNode;
};

const validateDuplicateTargets = <
  Override extends Keyed,
  MetadataNode extends Keyed,
>(
  issues: CustomizationValidationIssue[],
  overrides: readonly Override[] | undefined,
  index: ReturnType<typeof buildMetadataNodeIndex<MetadataNode>>,
  path: readonly (number | string)[],
  surface: string,
  label: string
): void => {
  if (!overrides) {
    return;
  }

  const firstOccurrenceByCanonicalId = new Map<
    string,
    {
      index: number;
      metadataNode: MetadataNode;
      override: Override;
    }
  >();

  for (const [overrideIndex, override] of overrides.entries()) {
    const resolvedTarget = resolveMetadataNodeTarget(override, index);

    if (!resolvedTarget) {
      continue;
    }

    const previous = firstOccurrenceByCanonicalId.get(
      resolvedTarget.canonicalId
    );

    if (!previous) {
      firstOccurrenceByCanonicalId.set(resolvedTarget.canonicalId, {
        index: overrideIndex,
        metadataNode: resolvedTarget.metadataNode,
        override,
      });
      continue;
    }

    addIssue(
      issues,
      "customization.duplicate_target",
      `${label} overrides target the same metadata node "${resolvedTarget.metadataNode.key}"`,
      [...path, overrideIndex],
      "error",
      "Merge the duplicate override entries so each metadata node is customized only once per surface.",
      {
        metadataNodeId: resolvedTarget.canonicalId,
        metadataNodeKey: resolvedTarget.metadataNode.key,
        surface,
        targetNodeId: override.id,
        targetNodeKey: override.key,
      }
    );
  }
};

const getValidationMode = (
  options: CustomizationMetadataValidationOptions
): CustomizationValidationMode => options.validationMode ?? "runtime";

const getFeatureTables = (
  metadata: CustomizableMetadata
): readonly MetadataTableContract[] => {
  if (!("tables" in metadata)) {
    return [];
  }

  return (metadata.tables ?? []).filter(
    (table): table is MetadataTableContract => "key" in table
  );
};

const getEntityTable = (
  metadata: CustomizableMetadata
): EntityTableMetadata | undefined =>
  "table" in metadata ? metadata.table : undefined;

const getMetadataKeySets = (
  metadata: CustomizableMetadata
): MetadataKeySets => ({
  actionKeys: keyedSet(metadata.actions),
  fieldKeys: keyedSet(metadata.fields),
  filterKeys: keyedSet(metadata.filters),
  formKeys: keyedSet(metadata.forms),
  sectionKeys: keyedSet(metadata.sections),
  tableKeys: keyedSet(getFeatureTables(metadata)),
});

const requireKnownReferences = (
  issues: CustomizationValidationIssue[],
  values: readonly string[] | undefined,
  allowedKeys: Set<string>,
  path: readonly (number | string)[],
  label: string
): void => {
  for (const [index, value] of (values ?? []).entries()) {
    if (!allowedKeys.has(value)) {
      addIssue(
        issues,
        "customization.unknown_reference",
        `${label} reference "${value}" does not exist in metadata`,
        [...path, index],
        "error",
        "Update the customization to reference an existing metadata key."
      );
    }
  }
};

const assertOverrideAllowed = (
  issues: CustomizationValidationIssue[],
  value: unknown,
  allowed: boolean | undefined,
  context: OverridePolicyContext
): void => {
  if (value === undefined || allowed) {
    return;
  }

  addIssue(
    issues,
    "customization.override_not_allowed",
    `${context.label} override is not allowed by metadata policy`,
    context.path,
    "error",
    context.hint ?? defaultPolicyHint
  );
};

const isCompanyScopeAllowed = (
  metadata: CustomizableMetadata,
  options: CustomizationMetadataValidationOptions
): boolean => {
  const allowedScopes = metadata.customization?.scopes;

  if (allowedScopes?.length) {
    return allowedScopes.includes("company");
  }

  return options.companyAware === true;
};

const isTenantScopeAllowed = (metadata: CustomizableMetadata): boolean => {
  const allowedScopes = metadata.customization?.scopes;

  if (!allowedScopes?.length) {
    return true;
  }

  return allowedScopes.includes("tenant");
};

const validateIdentityAndScope = (
  issues: CustomizationValidationIssue[],
  customization: CustomizationContract,
  metadata: CustomizableMetadata,
  options: CustomizationMetadataValidationOptions
): void => {
  if (metadata.id && customization.featureId !== metadata.id) {
    addIssue(
      issues,
      "customization.feature_mismatch",
      "customization featureId does not match metadata id",
      ["featureId"],
      "error",
      "Point the customization at the matching feature metadata id."
    );
  }

  if (customization.entity !== metadata.entity) {
    addIssue(
      issues,
      "customization.entity_mismatch",
      "customization entity does not match metadata entity",
      ["entity"],
      "error",
      "Point the customization at the matching metadata entity."
    );
  }

  if (
    customization.scope === "company" &&
    !isCompanyScopeAllowed(metadata, options)
  ) {
    addIssue(
      issues,
      "customization.company_scope_not_allowed",
      "company-scoped customization is not allowed for this metadata",
      ["scope"],
      "error",
      "Add 'company' to metadata.customization.scopes only for company-aware features."
    );
  }

  if (customization.scope === "tenant" && !isTenantScopeAllowed(metadata)) {
    addIssue(
      issues,
      "customization.tenant_scope_not_allowed",
      "tenant-scoped customization is not allowed for this metadata",
      ["scope"],
      "error",
      "Add 'tenant' to metadata.customization.scopes before using tenant-level customization."
    );
  }
};

const validateMetadataFingerprint = (
  issues: CustomizationValidationIssue[],
  customization: CustomizationContract,
  options: CustomizationMetadataValidationOptions
): void => {
  if (
    !(
      customization.baseMetadataFingerprint &&
      options.metadataFingerprint &&
      customization.baseMetadataFingerprint !== options.metadataFingerprint
    )
  ) {
    return;
  }

  const mode = getValidationMode(options);
  const severity =
    options.allowStaleMetadataFingerprint ||
    mode === "import-draft" ||
    mode === "preview"
      ? "warning"
      : "error";

  addIssue(
    issues,
    "customization.stale_metadata",
    "customization base metadata fingerprint is stale",
    ["baseMetadataFingerprint"],
    severity,
    severity === "warning"
      ? "Review the customization against the current metadata before publishing."
      : "Republish against the current metadata or import as draft-with-warnings for review."
  );
};

const validateTopLevelKeys = (
  issues: CustomizationValidationIssue[],
  customization: CustomizationContract,
  metadata: CustomizableMetadata,
  options: CustomizationMetadataValidationOptions
): void => {
  const fieldIndex = buildMetadataNodeIndex(metadata.fields);
  const sectionIndex = buildMetadataNodeIndex(metadata.sections);
  const formIndex = buildMetadataNodeIndex(metadata.forms);
  const filterIndex = buildMetadataNodeIndex(metadata.filters);
  const actionIndex = buildMetadataNodeIndex(metadata.actions);
  const tableIndex = buildMetadataNodeIndex(getFeatureTables(metadata));

  for (const [index, override] of (customization.fields ?? []).entries()) {
    resolveOverrideTarget(
      issues,
      override,
      fieldIndex,
      ["fields", index],
      "field",
      "field"
    );
  }

  validateDuplicateTargets(
    issues,
    customization.fields,
    fieldIndex,
    ["fields"],
    "field",
    "field"
  );

  for (const [index, override] of (customization.sections ?? []).entries()) {
    resolveOverrideTarget(
      issues,
      override,
      sectionIndex,
      ["sections", index],
      "section",
      "section"
    );
  }

  validateDuplicateTargets(
    issues,
    customization.sections,
    sectionIndex,
    ["sections"],
    "section",
    "section"
  );

  for (const [index, override] of (customization.forms ?? []).entries()) {
    resolveOverrideTarget(
      issues,
      override,
      formIndex,
      ["forms", index],
      "form",
      "form"
    );
  }

  validateDuplicateTargets(
    issues,
    customization.forms,
    formIndex,
    ["forms"],
    "form",
    "form"
  );

  for (const [index, override] of (customization.filters ?? []).entries()) {
    resolveOverrideTarget(
      issues,
      override,
      filterIndex,
      ["filters", index],
      "filter",
      "filter"
    );
  }

  validateDuplicateTargets(
    issues,
    customization.filters,
    filterIndex,
    ["filters"],
    "filter",
    "filter"
  );

  for (const [index, override] of (customization.actions ?? []).entries()) {
    resolveOverrideTarget(
      issues,
      override,
      actionIndex,
      ["actions", index],
      "action",
      "action"
    );
  }

  validateDuplicateTargets(
    issues,
    customization.actions,
    actionIndex,
    ["actions"],
    "action",
    "action"
  );

  if (
    options.rejectUnsupportedMetadataSurfaces ||
    getFeatureTables(metadata).length > 0
  ) {
    for (const [index, override] of (customization.tables ?? []).entries()) {
      resolveOverrideTarget(
        issues,
        override,
        tableIndex,
        ["tables", index],
        "table",
        "table"
      );
    }

    validateDuplicateTargets(
      issues,
      customization.tables,
      tableIndex,
      ["tables"],
      "table",
      "table"
    );
  }
};

const validateFieldPolicies = (
  issues: CustomizationValidationIssue[],
  customization: CustomizationContract,
  metadata: CustomizableMetadata
): void => {
  const metadataFieldIndex = buildMetadataNodeIndex(metadata.fields);

  for (const [index, fieldOverride] of (customization.fields ?? []).entries()) {
    const metadataField = resolveOverrideTarget(
      issues,
      fieldOverride,
      metadataFieldIndex,
      ["fields", index],
      "field",
      "field",
      false
    );

    if (!metadataField) {
      continue;
    }

    const policy = metadataField.customization;
    const basePath = ["fields", index] as const;

    if (policy?.systemOwned) {
      if (fieldOverride.hidden) {
        addIssue(
          issues,
          "customization.hidden_system_field",
          `system field "${fieldOverride.key}" cannot be hidden`,
          [...basePath, "hidden"],
          "error",
          "System-owned fields must stay visible and governed by the feature."
        );
      }

      if (
        fieldOverride.description !== undefined ||
        fieldOverride.label !== undefined ||
        fieldOverride.order !== undefined ||
        fieldOverride.placeholder !== undefined
      ) {
        addIssue(
          issues,
          "customization.override_not_allowed",
          `field "${fieldOverride.key}" is system-owned and cannot be customized`,
          [...basePath, "key"],
          "error",
          "Remove the override or mark the field as customizable in metadata."
        );
      }

      continue;
    }

    assertOverrideAllowed(issues, fieldOverride.label, policy?.label, {
      label: `field "${fieldOverride.key}" label`,
      path: [...basePath, "label"],
    });
    assertOverrideAllowed(
      issues,
      fieldOverride.description,
      policy?.description,
      {
        label: `field "${fieldOverride.key}" description`,
        path: [...basePath, "description"],
      }
    );
    assertOverrideAllowed(
      issues,
      fieldOverride.placeholder,
      policy?.placeholder,
      {
        label: `field "${fieldOverride.key}" placeholder`,
        path: [...basePath, "placeholder"],
      }
    );
    assertOverrideAllowed(issues, fieldOverride.order, policy?.order, {
      label: `field "${fieldOverride.key}" order`,
      path: [...basePath, "order"],
    });

    if (fieldOverride.hidden !== undefined && !policy?.hidden) {
      addIssue(
        issues,
        "customization.override_not_allowed",
        `field "${fieldOverride.key}" visibility override is not allowed by metadata policy`,
        [...basePath, "hidden"],
        "error",
        "Allow field hiding explicitly in metadata before using hidden overrides."
      );

      continue;
    }

    if (
      fieldOverride.hidden &&
      metadataField.required &&
      policy?.hidden !== "allow-required"
    ) {
      addIssue(
        issues,
        "customization.hidden_required_field",
        `required field "${fieldOverride.key}" cannot be hidden`,
        [...basePath, "hidden"],
        "error",
        "Allow required-field hiding explicitly only when the feature can safely tolerate it."
      );
    }
  }
};

const validateSectionPolicies = (
  issues: CustomizationValidationIssue[],
  customization: CustomizationContract,
  metadata: CustomizableMetadata
): void => {
  const sectionIndex = buildMetadataNodeIndex(metadata.sections);

  for (const [index, sectionOverride] of (
    customization.sections ?? []
  ).entries()) {
    const section = resolveOverrideTarget(
      issues,
      sectionOverride,
      sectionIndex,
      ["sections", index],
      "section",
      "section",
      false
    );

    if (!section) {
      continue;
    }

    const policy = section.customization;
    const basePath = ["sections", index] as const;

    assertOverrideAllowed(issues, sectionOverride.label, policy?.label, {
      label: `section "${sectionOverride.key}" label`,
      path: [...basePath, "label"],
    });
    assertOverrideAllowed(
      issues,
      sectionOverride.description,
      policy?.description,
      {
        label: `section "${sectionOverride.key}" description`,
        path: [...basePath, "description"],
      }
    );
    assertOverrideAllowed(issues, sectionOverride.hidden, policy?.hidden, {
      label: `section "${sectionOverride.key}" visibility`,
      path: [...basePath, "hidden"],
    });
    assertOverrideAllowed(issues, sectionOverride.columns, policy?.columns, {
      label: `section "${sectionOverride.key}" columns`,
      path: [...basePath, "columns"],
    });
    assertOverrideAllowed(
      issues,
      sectionOverride.fieldKeys,
      policy?.fieldKeys,
      {
        label: `section "${sectionOverride.key}" field grouping`,
        path: [...basePath, "fieldKeys"],
      }
    );
  }
};

const validateFormPolicies = (
  issues: CustomizationValidationIssue[],
  customization: CustomizationContract,
  metadata: CustomizableMetadata
): void => {
  const formIndex = buildMetadataNodeIndex(metadata.forms);

  for (const [index, formOverride] of (customization.forms ?? []).entries()) {
    const form = resolveOverrideTarget(
      issues,
      formOverride,
      formIndex,
      ["forms", index],
      "form",
      "form",
      false
    );

    if (!form) {
      continue;
    }

    const policy = form.customization;
    const basePath = ["forms", index] as const;

    assertOverrideAllowed(issues, formOverride.label, policy?.label, {
      label: `form "${formOverride.key}" label`,
      path: [...basePath, "label"],
    });
    assertOverrideAllowed(issues, formOverride.hidden, policy?.hidden, {
      label: `form "${formOverride.key}" visibility`,
      path: [...basePath, "hidden"],
    });
    assertOverrideAllowed(issues, formOverride.layout, policy?.layout, {
      label: `form "${formOverride.key}" layout`,
      path: [...basePath, "layout"],
    });
    assertOverrideAllowed(
      issues,
      formOverride.sectionKeys,
      policy?.sectionKeys,
      {
        label: `form "${formOverride.key}" section ordering`,
        path: [...basePath, "sectionKeys"],
      }
    );
  }
};

const validateFilterPolicies = (
  issues: CustomizationValidationIssue[],
  customization: CustomizationContract,
  metadata: CustomizableMetadata
): void => {
  const filterIndex = buildMetadataNodeIndex(metadata.filters);

  for (const [index, filterOverride] of (
    customization.filters ?? []
  ).entries()) {
    const filter = resolveOverrideTarget(
      issues,
      filterOverride,
      filterIndex,
      ["filters", index],
      "filter",
      "filter",
      false
    );

    if (!filter) {
      continue;
    }

    const policy = filter.customization;
    const basePath = ["filters", index] as const;

    assertOverrideAllowed(issues, filterOverride.label, policy?.label, {
      label: `filter "${filterOverride.key}" label`,
      path: [...basePath, "label"],
    });
    assertOverrideAllowed(issues, filterOverride.hidden, policy?.hidden, {
      label: `filter "${filterOverride.key}" visibility`,
      path: [...basePath, "hidden"],
    });
  }
};

const validatePresentationPolicies = (
  issues: CustomizationValidationIssue[],
  customization: CustomizationContract,
  metadata: CustomizableMetadata
): void => {
  const override = customization.presentation;

  if (!override) {
    return;
  }

  const policy = metadata.customization?.presentation;

  assertOverrideAllowed(issues, override.density, policy?.density, {
    label: "presentation density",
    path: ["presentation", "density"],
  });
  assertOverrideAllowed(issues, override.icon, policy?.icon, {
    label: "presentation icon",
    path: ["presentation", "icon"],
  });
  assertOverrideAllowed(issues, override.size, policy?.size, {
    label: "presentation size",
    path: ["presentation", "size"],
  });
  assertOverrideAllowed(issues, override.tone, policy?.tone, {
    label: "presentation tone",
    path: ["presentation", "tone"],
  });
  assertOverrideAllowed(issues, override.variant, policy?.variant, {
    label: "presentation variant",
    path: ["presentation", "variant"],
  });
};

const validateLayoutReferences = (
  issues: CustomizationValidationIssue[],
  customization: CustomizationContract,
  keySets: MetadataKeySets
): void => {
  for (const [sectionIndex, section] of (
    customization.sections ?? []
  ).entries()) {
    requireKnownReferences(
      issues,
      section.fieldKeys,
      keySets.fieldKeys,
      ["sections", sectionIndex, "fieldKeys"],
      "section field"
    );
  }

  for (const [formIndex, form] of (customization.forms ?? []).entries()) {
    requireKnownReferences(
      issues,
      form.sectionKeys,
      keySets.sectionKeys,
      ["forms", formIndex, "sectionKeys"],
      "form section"
    );
  }
};

const validateFeatureTableColumnPolicies = (
  issues: CustomizationValidationIssue[],
  tableOverride: FeatureTableOverride,
  tableIndex: number,
  metadataTable: MetadataTableContract,
  fieldKeys: Set<string>
): void => {
  const metadataColumnIndex = buildMetadataNodeIndex(metadataTable.columns);

  validateDuplicateTargets(
    issues,
    tableOverride.columns,
    metadataColumnIndex,
    ["tables", tableIndex, "columns"],
    "table-column",
    "table column"
  );

  for (const [columnIndex, columnOverride] of (
    tableOverride.columns ?? []
  ).entries()) {
    const metadataColumn = resolveOverrideTarget(
      issues,
      columnOverride,
      metadataColumnIndex,
      ["tables", tableIndex, "columns", columnIndex],
      "table-column",
      "table column",
      false
    );

    if (!metadataColumn) {
      continue;
    }

    if (columnOverride.field && !fieldKeys.has(columnOverride.field)) {
      addIssue(
        issues,
        "customization.unknown_reference",
        `table column field reference "${columnOverride.field}" does not exist in metadata`,
        ["tables", tableIndex, "columns", columnIndex, "field"],
        "error",
        "Reference a metadata field that exists on the feature."
      );
    }

    const policy = metadataColumn.customization;
    const basePath = ["tables", tableIndex, "columns", columnIndex] as const;

    assertOverrideAllowed(issues, columnOverride.label, policy?.label, {
      label: `table column "${columnOverride.key}" label`,
      path: [...basePath, "label"],
    });
    assertOverrideAllowed(issues, columnOverride.hidden, policy?.hidden, {
      label: `table column "${columnOverride.key}" visibility`,
      path: [...basePath, "hidden"],
    });
    assertOverrideAllowed(issues, columnOverride.order, policy?.order, {
      label: `table column "${columnOverride.key}" order`,
      path: [...basePath, "order"],
    });
    assertOverrideAllowed(issues, columnOverride.width, policy?.width, {
      label: `table column "${columnOverride.key}" width`,
      path: [...basePath, "width"],
    });
    assertOverrideAllowed(issues, columnOverride.align, policy?.align, {
      label: `table column "${columnOverride.key}" alignment`,
      path: [...basePath, "align"],
    });
    assertOverrideAllowed(issues, columnOverride.field, policy?.field, {
      label: `table column "${columnOverride.key}" field mapping`,
      path: [...basePath, "field"],
    });
  }
};

const validateFeatureTables = (
  issues: CustomizationValidationIssue[],
  customization: CustomizationContract,
  metadata: CustomizableMetadata,
  fieldKeys: Set<string>
): void => {
  const featureTables = getFeatureTables(metadata);

  if (featureTables.length === 0) {
    return;
  }

  const metadataTableIndex = buildMetadataNodeIndex(featureTables);

  for (const [tableIndex, tableOverride] of (
    customization.tables ?? []
  ).entries()) {
    const metadataTable = resolveOverrideTarget(
      issues,
      tableOverride,
      metadataTableIndex,
      ["tables", tableIndex],
      "table",
      "table",
      false
    );

    if (!metadataTable) {
      continue;
    }

    const policy = metadataTable.customization;
    const basePath = ["tables", tableIndex] as const;

    assertOverrideAllowed(issues, tableOverride.title, policy?.title, {
      label: `table "${tableOverride.key}" title`,
      path: [...basePath, "title"],
    });
    assertOverrideAllowed(issues, tableOverride.hidden, policy?.hidden, {
      label: `table "${tableOverride.key}" visibility`,
      path: [...basePath, "hidden"],
    });
    assertOverrideAllowed(issues, tableOverride.columns, policy?.columns, {
      label: `table "${tableOverride.key}" column configuration`,
      path: [...basePath, "columns"],
    });

    if (tableOverride.columns) {
      validateFeatureTableColumnPolicies(
        issues,
        tableOverride,
        tableIndex,
        metadataTable,
        fieldKeys
      );
    }
  }
};

const validateEntityTableSupport = (
  issues: CustomizationValidationIssue[],
  customization: CustomizationContract,
  options: CustomizationMetadataValidationOptions
): boolean => {
  if (!(customization.table && options.rejectUnsupportedMetadataSurfaces)) {
    return false;
  }

  addIssue(
    issues,
    "customization.entity_table_not_supported",
    "entity table customization is not supported for this metadata",
    ["table"],
    "error",
    "Remove entity-table overrides or target metadata that exposes an entity table."
  );

  return true;
};

const validateEntityTableColumnFieldReference = (
  issues: CustomizationValidationIssue[],
  columnOverride: EntityTableColumnOverride,
  columnIndex: number,
  fieldKeys: Set<string>
): void => {
  if (!columnOverride.field || fieldKeys.has(columnOverride.field)) {
    return;
  }

  addIssue(
    issues,
    "customization.unknown_reference",
    `entity table column field reference "${columnOverride.field}" does not exist in metadata`,
    ["table", "columns", columnIndex, "field"],
    "error",
    "Reference a metadata field that exists on the entity."
  );
};

const validateEntityTableColumnPolicies = (
  issues: CustomizationValidationIssue[],
  columns: readonly EntityTableMetadata["columns"][number][],
  customization: CustomizationContract,
  fieldKeys: Set<string>
): void => {
  const metadataColumnIndex = buildMetadataNodeIndex(columns);

  validateDuplicateTargets(
    issues,
    customization.table?.columns,
    metadataColumnIndex,
    ["table", "columns"],
    "entity-table-column",
    "entity table column"
  );

  for (const [columnIndex, columnOverride] of (
    customization.table?.columns ?? []
  ).entries()) {
    const metadataColumn = resolveOverrideTarget(
      issues,
      columnOverride,
      metadataColumnIndex,
      ["table", "columns", columnIndex],
      "entity-table-column",
      "entity table column",
      false
    );

    if (!metadataColumn) {
      continue;
    }

    validateEntityTableColumnFieldReference(
      issues,
      columnOverride,
      columnIndex,
      fieldKeys
    );

    const columnPolicy = metadataColumn.customization;
    const basePath = ["table", "columns", columnIndex] as const;

    assertOverrideAllowed(issues, columnOverride.label, columnPolicy?.label, {
      label: `entity table column "${columnOverride.key}" label`,
      path: [...basePath, "label"],
    });
    assertOverrideAllowed(issues, columnOverride.hidden, columnPolicy?.hidden, {
      label: `entity table column "${columnOverride.key}" visibility`,
      path: [...basePath, "hidden"],
    });
    assertOverrideAllowed(issues, columnOverride.order, columnPolicy?.order, {
      label: `entity table column "${columnOverride.key}" order`,
      path: [...basePath, "order"],
    });
    assertOverrideAllowed(issues, columnOverride.width, columnPolicy?.width, {
      label: `entity table column "${columnOverride.key}" width`,
      path: [...basePath, "width"],
    });
    assertOverrideAllowed(issues, columnOverride.align, columnPolicy?.align, {
      label: `entity table column "${columnOverride.key}" alignment`,
      path: [...basePath, "align"],
    });
    assertOverrideAllowed(issues, columnOverride.field, columnPolicy?.field, {
      label: `entity table column "${columnOverride.key}" field mapping`,
      path: [...basePath, "field"],
    });
  }
};

const collectSortableMetadataKeys = (
  columns: readonly SortableMetadataColumn[],
  keys: Set<string>
): void => {
  for (const column of columns) {
    if (!column.sortable) {
      continue;
    }

    keys.add(column.key);

    if (column.field) {
      keys.add(column.field);
    }
  }
};

const validateEntityTableDefaultSort = (
  issues: CustomizationValidationIssue[],
  customization: CustomizationContract,
  metadata: CustomizableMetadata,
  columns: readonly EntityTableMetadata["columns"][number][]
): void => {
  if (!customization.table?.defaultSort) {
    return;
  }

  const defaultSortKeys = new Set<string>();

  collectSortableMetadataKeys(columns, defaultSortKeys);

  for (const table of getFeatureTables(metadata)) {
    collectSortableMetadataKeys(table.columns, defaultSortKeys);
  }

  if (defaultSortKeys.has(customization.table.defaultSort)) {
    return;
  }

  addIssue(
    issues,
    "customization.invalid_default_sort",
    `defaultSort "${customization.table.defaultSort}" is not a known sortable metadata key`,
    ["table", "defaultSort"],
    "error",
    "Choose a sortable metadata column key or field reference."
  );
};

const validateEntityTable = (
  issues: CustomizationValidationIssue[],
  customization: CustomizationContract,
  metadata: CustomizableMetadata,
  fieldKeys: Set<string>,
  options: CustomizationMetadataValidationOptions
): void => {
  const entityTable = getEntityTable(metadata);

  if (!entityTable) {
    validateEntityTableSupport(issues, customization, options);
    return;
  }

  const policy = entityTable.customization;

  assertOverrideAllowed(issues, customization.table?.title, policy?.title, {
    label: "entity table title",
    path: ["table", "title"],
  });
  assertOverrideAllowed(
    issues,
    customization.table?.defaultSort,
    policy?.defaultSort,
    {
      label: "entity table default sort",
      path: ["table", "defaultSort"],
    }
  );
  assertOverrideAllowed(issues, customization.table?.columns, policy?.columns, {
    label: "entity table column configuration",
    path: ["table", "columns"],
  });

  validateEntityTableColumnPolicies(
    issues,
    entityTable.columns,
    customization,
    fieldKeys
  );
  validateEntityTableDefaultSort(
    issues,
    customization,
    metadata,
    entityTable.columns
  );
};

const validateActionPolicies = (
  issues: CustomizationValidationIssue[],
  customization: CustomizationContract,
  metadata: CustomizableMetadata
): void => {
  const actionIndex = buildMetadataNodeIndex(metadata.actions);

  for (const [index, actionOverride] of (
    customization.actions ?? []
  ).entries()) {
    const metadataAction = resolveOverrideTarget(
      issues,
      actionOverride,
      actionIndex,
      ["actions", index],
      "action",
      "action",
      false
    );

    if (!metadataAction) {
      continue;
    }

    const policy = metadataAction.customization;

    if (!policy?.safe) {
      addIssue(
        issues,
        "customization.unsafe_action",
        `action "${actionOverride.key}" is not approved for customization`,
        ["actions", index, "key"],
        "error",
        "Mark the action metadata customization.safe = true only for presentation-safe actions."
      );

      continue;
    }

    const basePath = ["actions", index] as const;

    assertOverrideAllowed(issues, actionOverride.label, policy.label, {
      label: `action "${actionOverride.key}" label`,
      path: [...basePath, "label"],
    });
    assertOverrideAllowed(issues, actionOverride.hidden, policy.hidden, {
      label: `action "${actionOverride.key}" visibility`,
      path: [...basePath, "hidden"],
    });
    assertOverrideAllowed(issues, actionOverride.placement, policy.placement, {
      label: `action "${actionOverride.key}" placement`,
      path: [...basePath, "placement"],
    });
  }
};

export const validateCustomizationAgainstMetadata = (
  customization: CustomizationContract,
  metadata: CustomizableMetadata,
  options: CustomizationMetadataValidationOptions = {}
): CustomizationValidationResult => {
  const issues: CustomizationValidationIssue[] = [];
  const keySets = getMetadataKeySets(metadata);

  validateIdentityAndScope(issues, customization, metadata, options);
  validateMetadataFingerprint(issues, customization, options);
  validateTopLevelKeys(issues, customization, metadata, options);
  validateFieldPolicies(issues, customization, metadata);
  validateSectionPolicies(issues, customization, metadata);
  validateFormPolicies(issues, customization, metadata);
  validateFilterPolicies(issues, customization, metadata);
  validatePresentationPolicies(issues, customization, metadata);
  validateLayoutReferences(issues, customization, keySets);
  validateFeatureTables(issues, customization, metadata, keySets.fieldKeys);
  validateEntityTable(
    issues,
    customization,
    metadata,
    keySets.fieldKeys,
    options
  );
  validateActionPolicies(issues, customization, metadata);

  return {
    issues,
    valid: issues.every((issue) => issue.severity !== "error"),
    validationMode: getValidationMode(options),
  };
};

export const assertCustomizationMatchesMetadata = (
  customization: CustomizationContract,
  metadata: CustomizableMetadata,
  options: CustomizationMetadataValidationOptions = {}
): CustomizationContract => {
  const result = validateCustomizationAgainstMetadata(
    customization,
    metadata,
    options
  );

  if (!result.valid) {
    const message = result.issues
      .filter((issue) => issue.severity === "error")
      .map((issue) => issue.message)
      .join("; ");

    throw new Error(message || "customization metadata validation failed");
  }

  return customization;
};
