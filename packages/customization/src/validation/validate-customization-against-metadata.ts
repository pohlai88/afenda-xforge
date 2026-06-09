import type { EntityMetadata, MetadataFeatureContract } from "@repo/metadata";

import type { CustomizationContract } from "../contracts/customization.contract.ts";

export type CustomizationValidationSeverity = "error" | "warning";

export type CustomizationValidationIssue = {
  code: string;
  message: string;
  path: readonly (number | string)[];
  severity: CustomizationValidationSeverity;
};

export type CustomizationValidationResult = {
  issues: readonly CustomizationValidationIssue[];
  valid: boolean;
};

export type CustomizationMetadataValidationOptions = {
  allowHideRequiredFieldKeys?: readonly string[];
  allowStaleMetadataFingerprint?: boolean;
  companyAware?: boolean;
  metadataFingerprint?: string;
  safeActionKeys?: readonly string[];
  systemFieldKeys?: readonly string[];
};

type CustomizableMetadata = EntityMetadata | MetadataFeatureContract;

type Keyed = {
  key: string;
};

type EntityTableColumn = NonNullable<
  EntityMetadata["table"]
>["columns"][number];
type MetadataTable = NonNullable<MetadataFeatureContract["tables"]>[number];

const addIssue = (
  issues: CustomizationValidationIssue[],
  issue: CustomizationValidationIssue
): void => {
  issues.push(issue);
};

const keyedSet = (items: readonly Keyed[] | undefined): Set<string> =>
  new Set((items ?? []).map((item) => item.key));

const requireKnownKeys = (
  issues: CustomizationValidationIssue[],
  overrides: readonly Keyed[] | undefined,
  allowedKeys: Set<string>,
  path: readonly (number | string)[],
  label: string
): void => {
  for (const [index, override] of (overrides ?? []).entries()) {
    if (!allowedKeys.has(override.key)) {
      addIssue(issues, {
        code: "customization.unknown_key",
        message: `${label} override key "${override.key}" does not exist in metadata`,
        path: [...path, index, "key"],
        severity: "error",
      });
    }
  }
};

const requireKnownReferences = (
  issues: CustomizationValidationIssue[],
  values: readonly string[] | undefined,
  allowedKeys: Set<string>,
  path: readonly (number | string)[],
  label: string
): void => {
  for (const [index, value] of (values ?? []).entries()) {
    if (!allowedKeys.has(value)) {
      addIssue(issues, {
        code: "customization.unknown_reference",
        message: `${label} reference "${value}" does not exist in metadata`,
        path: [...path, index],
        severity: "error",
      });
    }
  }
};

const getFeatureTables = (
  metadata: CustomizableMetadata
): readonly MetadataTable[] => {
  if (!("tables" in metadata)) {
    return [];
  }

  return (metadata.tables ?? []).filter(
    (table): table is MetadataTable => "key" in table
  );
};

const getEntityTableColumns = (
  metadata: CustomizableMetadata
): readonly EntityTableColumn[] => {
  if (!("table" in metadata && metadata.table)) {
    return [];
  }

  return metadata.table.columns;
};

const getDefaultSortKeys = (metadata: CustomizableMetadata): Set<string> => {
  const keys = new Set<string>();

  for (const column of getEntityTableColumns(metadata)) {
    if (column.sortable) {
      keys.add(column.key);

      if (column.field) {
        keys.add(column.field);
      }
    }
  }

  for (const table of getFeatureTables(metadata)) {
    for (const column of table.columns) {
      if (column.sortable) {
        keys.add(column.key);

        if (column.field) {
          keys.add(column.field);
        }
      }
    }
  }

  return keys;
};

type MetadataKeySets = {
  actionKeys: Set<string>;
  fieldKeys: Set<string>;
  filterKeys: Set<string>;
  formKeys: Set<string>;
  sectionKeys: Set<string>;
  tableKeys: Set<string>;
};

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

const validateIdentityAndScope = (
  issues: CustomizationValidationIssue[],
  customization: CustomizationContract,
  metadata: CustomizableMetadata,
  options: CustomizationMetadataValidationOptions
): void => {
  if (metadata.id && customization.featureId !== metadata.id) {
    addIssue(issues, {
      code: "customization.feature_mismatch",
      message: "customization featureId does not match metadata id",
      path: ["featureId"],
      severity: "error",
    });
  }

  if (customization.entity !== metadata.entity) {
    addIssue(issues, {
      code: "customization.entity_mismatch",
      message: "customization entity does not match metadata entity",
      path: ["entity"],
      severity: "error",
    });
  }

  if (customization.scope === "company" && !options.companyAware) {
    addIssue(issues, {
      code: "customization.company_scope_not_allowed",
      message: "company-scoped customization is not allowed for this metadata",
      path: ["scope"],
      severity: "error",
    });
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

  addIssue(issues, {
    code: "customization.stale_metadata",
    message: "customization base metadata fingerprint is stale",
    path: ["baseMetadataFingerprint"],
    severity: options.allowStaleMetadataFingerprint ? "warning" : "error",
  });
};

const validateTopLevelKeys = (
  issues: CustomizationValidationIssue[],
  customization: CustomizationContract,
  keySets: MetadataKeySets
): void => {
  requireKnownKeys(
    issues,
    customization.fields,
    keySets.fieldKeys,
    ["fields"],
    "field"
  );
  requireKnownKeys(
    issues,
    customization.sections,
    keySets.sectionKeys,
    ["sections"],
    "section"
  );
  requireKnownKeys(
    issues,
    customization.forms,
    keySets.formKeys,
    ["forms"],
    "form"
  );
  requireKnownKeys(
    issues,
    customization.filters,
    keySets.filterKeys,
    ["filters"],
    "filter"
  );
  requireKnownKeys(
    issues,
    customization.actions,
    keySets.actionKeys,
    ["actions"],
    "action"
  );

  if (keySets.tableKeys.size > 0) {
    requireKnownKeys(
      issues,
      customization.tables,
      keySets.tableKeys,
      ["tables"],
      "table"
    );
  }
};

const validateFieldSafety = (
  issues: CustomizationValidationIssue[],
  customization: CustomizationContract,
  metadata: CustomizableMetadata,
  options: CustomizationMetadataValidationOptions
): void => {
  const requiredFieldKeys = new Set(
    (metadata.fields ?? [])
      .filter((field) => field.required)
      .map((field) => field.key)
  );
  const allowedHiddenRequiredFields = new Set(
    options.allowHideRequiredFieldKeys ?? []
  );
  const systemFieldKeys = new Set(options.systemFieldKeys ?? []);

  for (const [index, field] of (customization.fields ?? []).entries()) {
    if (
      field.hidden &&
      requiredFieldKeys.has(field.key) &&
      !allowedHiddenRequiredFields.has(field.key)
    ) {
      addIssue(issues, {
        code: "customization.hidden_required_field",
        message: `required field "${field.key}" cannot be hidden`,
        path: ["fields", index, "hidden"],
        severity: "error",
      });
    }

    if (field.hidden && systemFieldKeys.has(field.key)) {
      addIssue(issues, {
        code: "customization.hidden_system_field",
        message: `system field "${field.key}" cannot be hidden`,
        path: ["fields", index, "hidden"],
        severity: "error",
      });
    }
  }
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

const validateFeatureTables = (
  issues: CustomizationValidationIssue[],
  customization: CustomizationContract,
  metadata: CustomizableMetadata,
  fieldKeys: Set<string>
): void => {
  const featureTablesByKey = new Map(
    getFeatureTables(metadata).map((table) => [table.key, table])
  );

  for (const [tableIndex, table] of (customization.tables ?? []).entries()) {
    const metadataTable = featureTablesByKey.get(table.key);

    if (!metadataTable) {
      continue;
    }

    requireKnownKeys(
      issues,
      table.columns,
      keyedSet(metadataTable.columns),
      ["tables", tableIndex, "columns"],
      "table column"
    );

    for (const [columnIndex, column] of (table.columns ?? []).entries()) {
      if (column.field && !fieldKeys.has(column.field)) {
        addIssue(issues, {
          code: "customization.unknown_reference",
          message: `table column field reference "${column.field}" does not exist in metadata`,
          path: ["tables", tableIndex, "columns", columnIndex, "field"],
          severity: "error",
        });
      }
    }
  }
};

const validateEntityTable = (
  issues: CustomizationValidationIssue[],
  customization: CustomizationContract,
  metadata: CustomizableMetadata,
  fieldKeys: Set<string>
): void => {
  const entityTableColumns = getEntityTableColumns(metadata);

  if (entityTableColumns.length === 0) {
    return;
  }

  requireKnownKeys(
    issues,
    customization.table?.columns,
    keyedSet(entityTableColumns),
    ["table", "columns"],
    "entity table column"
  );

  for (const [columnIndex, column] of (
    customization.table?.columns ?? []
  ).entries()) {
    if (column.field && !fieldKeys.has(column.field)) {
      addIssue(issues, {
        code: "customization.unknown_reference",
        message: `entity table column field reference "${column.field}" does not exist in metadata`,
        path: ["table", "columns", columnIndex, "field"],
        severity: "error",
      });
    }
  }

  if (!customization.table?.defaultSort) {
    return;
  }

  const defaultSortKeys = getDefaultSortKeys(metadata);

  if (!defaultSortKeys.has(customization.table.defaultSort)) {
    addIssue(issues, {
      code: "customization.invalid_default_sort",
      message: `defaultSort "${customization.table.defaultSort}" is not a known sortable metadata key`,
      path: ["table", "defaultSort"],
      severity: "error",
    });
  }
};

const validateSafeActions = (
  issues: CustomizationValidationIssue[],
  customization: CustomizationContract,
  options: CustomizationMetadataValidationOptions
): void => {
  const safeActionKeys = new Set(options.safeActionKeys);

  if (safeActionKeys.size === 0) {
    return;
  }

  for (const [index, action] of (customization.actions ?? []).entries()) {
    if (!safeActionKeys.has(action.key)) {
      addIssue(issues, {
        code: "customization.unsafe_action",
        message: `action "${action.key}" is not approved for customization`,
        path: ["actions", index, "key"],
        severity: "error",
      });
    }
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
  validateTopLevelKeys(issues, customization, keySets);
  validateFieldSafety(issues, customization, metadata, options);
  validateLayoutReferences(issues, customization, keySets);
  validateFeatureTables(issues, customization, metadata, keySets.fieldKeys);
  validateEntityTable(issues, customization, metadata, keySets.fieldKeys);
  validateSafeActions(issues, customization, options);

  return {
    issues,
    valid: issues.every((issue) => issue.severity !== "error"),
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
