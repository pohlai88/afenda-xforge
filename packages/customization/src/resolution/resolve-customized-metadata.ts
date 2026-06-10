import type {
  EntityMetadata,
  EntityTableMetadata,
  MetadataActionContract,
  MetadataFeatureContract,
  MetadataFieldContract,
  MetadataFilterContract,
  MetadataFormContract,
  MetadataSectionContract,
  MetadataTableColumn,
  MetadataTableContract,
} from "@repo/metadata";

import type { CustomizationContract } from "../contracts/customization.contract.ts";
import { getCanonicalMetadataNodeId } from "../internal/metadata-node-resolution.ts";
import type {
  NormalizedActionOverride,
  NormalizedFieldOverride,
  NormalizedFilterOverride,
  NormalizedFormOverride,
  NormalizedSectionOverride,
  NormalizedTableColumnOverride,
  NormalizedTableOverride,
} from "../internal/normalized-customization.ts";
import { normalizeCustomizationAgainstMetadata } from "../internal/normalized-customization.ts";
import { assertCustomizationContract } from "../validation/assert-customization-contract.ts";
import type { CustomizationMetadataValidationOptions } from "../validation/validate-customization-against-metadata.ts";
import { assertCustomizationMatchesMetadata } from "../validation/validate-customization-against-metadata.ts";

export type ResolveCustomizationOptions =
  CustomizationMetadataValidationOptions & {
    validate?: boolean;
  };

type EntityTableColumn = EntityTableMetadata["columns"][number];

type Keyed = {
  id?: string;
  key: string;
};

type CanonicalOverride = {
  canonicalId: string;
  hidden?: boolean;
  order?: number;
};

const mergeByKey = <Item extends Keyed, Override extends CanonicalOverride>(
  items: readonly Item[] | undefined,
  overrides: readonly Override[] | undefined,
  mergeItem: (item: Item, override: Override) => Item
): readonly Item[] | undefined => {
  if (!items) {
    return;
  }

  if (!(overrides && overrides.length > 0)) {
    return items;
  }

  const overrideByCanonicalId = new Map<string, Override>();
  const originalIndexByKey = new Map(
    items.map((item, index) => [getCanonicalMetadataNodeId(item), index])
  );

  for (const override of overrides) {
    overrideByCanonicalId.set(override.canonicalId, override);
  }

  return items
    .flatMap((item) => {
      const canonicalId = getCanonicalMetadataNodeId(item);
      const override = overrideByCanonicalId.get(canonicalId);

      if (override?.hidden) {
        return [];
      }

      return [override ? mergeItem(item, override) : item];
    })
    .sort((left, right) => {
      const leftCanonicalId = getCanonicalMetadataNodeId(left);
      const rightCanonicalId = getCanonicalMetadataNodeId(right);
      const leftOrder = overrideByCanonicalId.get(leftCanonicalId)?.order;
      const rightOrder = overrideByCanonicalId.get(rightCanonicalId)?.order;

      if (
        typeof leftOrder === "number" &&
        typeof rightOrder === "number" &&
        leftOrder !== rightOrder
      ) {
        return leftOrder - rightOrder;
      }

      if (typeof leftOrder === "number" && typeof rightOrder !== "number") {
        return -1;
      }

      if (typeof rightOrder === "number" && typeof leftOrder !== "number") {
        return 1;
      }

      return (
        (originalIndexByKey.get(leftCanonicalId) ?? 0) -
        (originalIndexByKey.get(rightCanonicalId) ?? 0)
      );
    });
};

const mergeFields = (
  fields: readonly MetadataFieldContract[] | undefined,
  overrides: readonly NormalizedFieldOverride[] | undefined
): readonly MetadataFieldContract[] | undefined =>
  mergeByKey(fields, overrides, (field, override) => ({
    ...field,
    description: override.description ?? field.description,
    label: override.label ?? field.label,
    placeholder: override.placeholder ?? field.placeholder,
  }));

const mergeSections = (
  sections: readonly MetadataSectionContract[] | undefined,
  overrides: readonly NormalizedSectionOverride[] | undefined
): readonly MetadataSectionContract[] | undefined =>
  mergeByKey(sections, overrides, (section, override) => ({
    ...section,
    columns: override.columns ?? section.columns,
    description: override.description ?? section.description,
    fieldKeys: override.fieldKeys ?? section.fieldKeys,
    label: override.label ?? section.label,
  }));

const mergeForms = (
  forms: readonly MetadataFormContract[] | undefined,
  overrides: readonly NormalizedFormOverride[] | undefined
): readonly MetadataFormContract[] | undefined =>
  mergeByKey(forms, overrides, (form, override) => ({
    ...form,
    label: override.label ?? form.label,
    layout: override.layout ?? form.layout,
    sectionKeys: override.sectionKeys ?? form.sectionKeys,
  }));

const mergeTableColumns = (
  columns: readonly MetadataTableColumn[],
  overrides: readonly NormalizedTableColumnOverride[] | undefined
): readonly MetadataTableColumn[] =>
  mergeByKey(columns, overrides, (column, override) => ({
    ...column,
    align: override.align ?? column.align,
    field: override.field ?? column.field,
    label: override.label ?? column.label,
    width: override.width ?? column.width,
  })) ?? columns;

const mergeEntityTableColumns = (
  columns: readonly EntityTableColumn[],
  overrides: readonly NormalizedTableColumnOverride[] | undefined
): readonly EntityTableColumn[] =>
  mergeByKey(columns, overrides, (column, override) => ({
    ...column,
    align: override.align ?? column.align,
    field: override.field ?? column.field,
    label: override.label ?? column.label,
    width: override.width ?? column.width,
  })) ?? columns;

const mergeTables = (
  tables: readonly MetadataTableContract[] | undefined,
  overrides: readonly NormalizedTableOverride[] | undefined
): readonly MetadataTableContract[] | undefined =>
  mergeByKey(tables, overrides, (table, override) => ({
    ...table,
    columns: mergeTableColumns(table.columns, override.columns),
    title: override.title ?? table.title,
  }));

const mergeFilters = (
  filters: readonly MetadataFilterContract[] | undefined,
  overrides: readonly NormalizedFilterOverride[] | undefined
): readonly MetadataFilterContract[] | undefined =>
  mergeByKey(filters, overrides, (filter, override) => ({
    ...filter,
    label: override.label ?? filter.label,
  }));

const mergeActions = (
  actions: readonly MetadataActionContract[] | undefined,
  overrides: readonly NormalizedActionOverride[] | undefined
): readonly MetadataActionContract[] | undefined =>
  mergeByKey(actions, overrides, (action, override) => ({
    ...action,
    label: override.label ?? action.label,
    placement: override.placement ?? action.placement,
  }));

const sanitizeSectionFieldKeys = (
  sections: readonly MetadataSectionContract[] | undefined,
  visibleFieldKeys: ReadonlySet<string> | undefined
): readonly MetadataSectionContract[] | undefined => {
  if (!(sections && visibleFieldKeys)) {
    return sections;
  }

  return sections
    .map((section) => ({
      ...section,
      fieldKeys: section.fieldKeys.filter((fieldKey) =>
        visibleFieldKeys.has(fieldKey)
      ),
    }))
    .filter((section) => section.fieldKeys.length > 0);
};

const sanitizeFormReferences = (
  forms: readonly MetadataFormContract[] | undefined,
  visibleFieldKeys: ReadonlySet<string> | undefined,
  visibleSectionKeys: ReadonlySet<string> | undefined
): readonly MetadataFormContract[] | undefined => {
  if (!(forms && (visibleFieldKeys || visibleSectionKeys))) {
    return forms;
  }

  return forms.map((form) => ({
    ...form,
    fieldKeys: visibleFieldKeys
      ? form.fieldKeys.filter((fieldKey) => visibleFieldKeys.has(fieldKey))
      : form.fieldKeys,
    sectionKeys: form.sectionKeys?.filter(
      (sectionKey) =>
        !(visibleSectionKeys && !visibleSectionKeys.has(sectionKey))
    ),
  }));
};

export const resolveCustomizedMetadata = (
  metadata: MetadataFeatureContract,
  customization?: CustomizationContract | null,
  options: ResolveCustomizationOptions = {}
): MetadataFeatureContract => {
  if (!customization) {
    return metadata;
  }

  const normalizedCustomization = normalizeCustomizationAgainstMetadata(
    options.validate === false
      ? customization
      : assertCustomizationContract(customization),
    metadata
  );

  if (options.validate !== false) {
    assertCustomizationMatchesMetadata(
      normalizedCustomization,
      metadata,
      options
    );
  }

  const fields = mergeFields(metadata.fields, normalizedCustomization.fields);
  const sections = mergeSections(
    metadata.sections,
    normalizedCustomization.sections
  );
  const visibleFieldKeys = fields
    ? new Set(fields.map((field) => field.key))
    : undefined;
  const sanitizedSections = sanitizeSectionFieldKeys(
    sections,
    visibleFieldKeys
  );
  const visibleSectionKeys = sanitizedSections
    ? new Set(sanitizedSections.map((section) => section.key))
    : undefined;
  const forms = sanitizeFormReferences(
    mergeForms(metadata.forms, normalizedCustomization.forms),
    visibleFieldKeys,
    visibleSectionKeys
  );

  return {
    ...metadata,
    actions: mergeActions(metadata.actions, normalizedCustomization.actions),
    description: normalizedCustomization.description ?? metadata.description,
    fields,
    filters: mergeFilters(metadata.filters, normalizedCustomization.filters),
    forms,
    presentation: {
      ...metadata.presentation,
      ...normalizedCustomization.presentation,
    },
    sections: sanitizedSections,
    tables: mergeTables(metadata.tables, normalizedCustomization.tables),
    title: normalizedCustomization.title ?? metadata.title,
  };
};

export const resolveCustomizedEntityMetadata = (
  metadata: EntityMetadata,
  customization?: CustomizationContract | null,
  options: ResolveCustomizationOptions = {}
): EntityMetadata => {
  if (!customization) {
    return metadata;
  }

  const normalizedCustomization = normalizeCustomizationAgainstMetadata(
    options.validate === false
      ? customization
      : assertCustomizationContract(customization),
    metadata
  );

  if (options.validate !== false) {
    assertCustomizationMatchesMetadata(
      normalizedCustomization,
      metadata,
      options
    );
  }

  const fields = mergeFields(metadata.fields, normalizedCustomization.fields);
  const sections = mergeSections(
    metadata.sections,
    normalizedCustomization.sections
  );
  const visibleFieldKeys = fields
    ? new Set(fields.map((field) => field.key))
    : undefined;
  const sanitizedSections = sanitizeSectionFieldKeys(
    sections,
    visibleFieldKeys
  );
  const visibleSectionKeys = sanitizedSections
    ? new Set(sanitizedSections.map((section) => section.key))
    : undefined;
  const forms = sanitizeFormReferences(
    mergeForms(metadata.forms, normalizedCustomization.forms),
    visibleFieldKeys,
    visibleSectionKeys
  );

  return {
    ...metadata,
    actions: mergeActions(metadata.actions, normalizedCustomization.actions),
    description: normalizedCustomization.description ?? metadata.description,
    fields,
    filters: mergeFilters(metadata.filters, normalizedCustomization.filters),
    forms,
    presentation: {
      ...metadata.presentation,
      ...normalizedCustomization.presentation,
    },
    sections: sanitizedSections,
    table: metadata.table
      ? {
          ...metadata.table,
          columns: mergeEntityTableColumns(
            metadata.table.columns,
            normalizedCustomization.table?.columns
          ),
          defaultSort:
            normalizedCustomization.table?.defaultSort ??
            metadata.table.defaultSort,
          title: normalizedCustomization.table?.title ?? metadata.table.title,
        }
      : undefined,
    title: normalizedCustomization.title ?? metadata.title,
  };
};
