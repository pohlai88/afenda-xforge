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

import type {
  CustomizationActionOverrideContract,
  CustomizationContract,
  CustomizationFieldOverrideContract,
  CustomizationFilterOverrideContract,
  CustomizationFormOverrideContract,
  CustomizationSectionOverrideContract,
  CustomizationTableColumnOverrideContract,
  CustomizationTableOverrideContract,
} from "../contracts/customization.contract.ts";
import type { CustomizationMetadataValidationOptions } from "../validation/validate-customization-against-metadata.ts";
import { assertCustomizationMatchesMetadata } from "../validation/validate-customization-against-metadata.ts";

export type ResolveCustomizationOptions =
  CustomizationMetadataValidationOptions & {
    validate?: boolean;
  };

type EntityTableColumn = EntityTableMetadata["columns"][number];

type Keyed = {
  key: string;
};

type OrderedOverride = Keyed & {
  hidden?: boolean;
  order?: number;
};

const mergeByKey = <Item extends Keyed, Override extends OrderedOverride>(
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

  const overrideByKey = new Map(
    overrides.map((override) => [override.key, override])
  );
  const originalIndexByKey = new Map(
    items.map((item, index) => [item.key, index])
  );

  return items
    .flatMap((item) => {
      const override = overrideByKey.get(item.key);

      if (override?.hidden) {
        return [];
      }

      return [override ? mergeItem(item, override) : item];
    })
    .sort((left, right) => {
      const leftOrder = overrideByKey.get(left.key)?.order;
      const rightOrder = overrideByKey.get(right.key)?.order;

      if (typeof leftOrder === "number" && typeof rightOrder === "number") {
        return leftOrder - rightOrder;
      }

      if (typeof leftOrder === "number") {
        return -1;
      }

      if (typeof rightOrder === "number") {
        return 1;
      }

      return (
        (originalIndexByKey.get(left.key) ?? 0) -
        (originalIndexByKey.get(right.key) ?? 0)
      );
    });
};

const mergeFields = (
  fields: readonly MetadataFieldContract[] | undefined,
  overrides: readonly CustomizationFieldOverrideContract[] | undefined
): readonly MetadataFieldContract[] | undefined =>
  mergeByKey(fields, overrides, (field, override) => ({
    ...field,
    description: override.description ?? field.description,
    label: override.label ?? field.label,
    placeholder: override.placeholder ?? field.placeholder,
  }));

const mergeSections = (
  sections: readonly MetadataSectionContract[] | undefined,
  overrides: readonly CustomizationSectionOverrideContract[] | undefined
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
  overrides: readonly CustomizationFormOverrideContract[] | undefined
): readonly MetadataFormContract[] | undefined =>
  mergeByKey(forms, overrides, (form, override) => ({
    ...form,
    label: override.label ?? form.label,
    layout: override.layout ?? form.layout,
    sectionKeys: override.sectionKeys ?? form.sectionKeys,
  }));

const mergeTableColumns = (
  columns: readonly MetadataTableColumn[],
  overrides: readonly CustomizationTableColumnOverrideContract[] | undefined
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
  overrides: readonly CustomizationTableColumnOverrideContract[] | undefined
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
  overrides: readonly CustomizationTableOverrideContract[] | undefined
): readonly MetadataTableContract[] | undefined =>
  mergeByKey(tables, overrides, (table, override) => ({
    ...table,
    columns: mergeTableColumns(table.columns, override.columns),
    title: override.title ?? table.title,
  }));

const mergeFilters = (
  filters: readonly MetadataFilterContract[] | undefined,
  overrides: readonly CustomizationFilterOverrideContract[] | undefined
): readonly MetadataFilterContract[] | undefined =>
  mergeByKey(filters, overrides, (filter, override) => ({
    ...filter,
    label: override.label ?? filter.label,
  }));

const mergeActions = (
  actions: readonly MetadataActionContract[] | undefined,
  overrides: readonly CustomizationActionOverrideContract[] | undefined
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

  return sections.map((section) => ({
    ...section,
    fieldKeys: section.fieldKeys.filter((fieldKey) =>
      visibleFieldKeys.has(fieldKey)
    ),
  }));
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

  if (options.validate !== false) {
    assertCustomizationMatchesMetadata(customization, metadata, options);
  }

  const fields = mergeFields(metadata.fields, customization.fields);
  const sections = mergeSections(metadata.sections, customization.sections);
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
    mergeForms(metadata.forms, customization.forms),
    visibleFieldKeys,
    visibleSectionKeys
  );

  return {
    ...metadata,
    actions: mergeActions(metadata.actions, customization.actions),
    description: customization.description ?? metadata.description,
    fields,
    filters: mergeFilters(metadata.filters, customization.filters),
    forms,
    presentation: {
      ...metadata.presentation,
      ...customization.presentation,
    },
    sections: sanitizedSections,
    tables: mergeTables(metadata.tables, customization.tables),
    title: customization.title ?? metadata.title,
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

  if (options.validate !== false) {
    assertCustomizationMatchesMetadata(customization, metadata, options);
  }

  const fields = mergeFields(metadata.fields, customization.fields);
  const sections = mergeSections(metadata.sections, customization.sections);
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
    mergeForms(metadata.forms, customization.forms),
    visibleFieldKeys,
    visibleSectionKeys
  );

  return {
    ...metadata,
    actions: mergeActions(metadata.actions, customization.actions),
    description: customization.description ?? metadata.description,
    fields,
    filters: mergeFilters(metadata.filters, customization.filters),
    forms,
    presentation: {
      ...metadata.presentation,
      ...customization.presentation,
    },
    sections: sanitizedSections,
    table: metadata.table
      ? {
          ...metadata.table,
          columns: mergeEntityTableColumns(
            metadata.table.columns,
            customization.table?.columns
          ),
          defaultSort:
            customization.table?.defaultSort ?? metadata.table.defaultSort,
          title: customization.table?.title ?? metadata.table.title,
        }
      : undefined,
    title: customization.title ?? metadata.title,
  };
};
