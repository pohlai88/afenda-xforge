import type { MetadataUiManifestEntry } from "../../metadata-ui.manifest.ts";
import type {
  MetadataActionContract,
  MetadataActionPlacement,
  MetadataActionSurface,
} from "../contracts/action-renderer.contract";
import { metadataActionKinds } from "../contracts/action-renderer.contract";
import type {
  MetadataFieldContract,
  MetadataFieldKind,
  MetadataFieldOption,
  MetadataFieldValidationRule,
} from "../contracts/field-renderer.contract";
import { metadataFieldKinds } from "../contracts/field-renderer.contract";
import type { MetadataUiState } from "../contracts/render-context.contract";
import type {
  MetadataSectionContract,
  MetadataSectionKind,
} from "../contracts/section-renderer.contract";
import { metadataSectionKinds } from "../contracts/section-renderer.contract";
import type {
  MetadataRendererDiagnostic,
  MetadataRendererResolutionKind,
} from "./diagnostics";
import {
  createDuplicateRendererDiagnostic,
  createInvalidContractDiagnostic,
} from "./diagnostics";
import { metadataUiStateKeys } from "./state-renderers.tsx";

const supportedMetadataStates = new Set<MetadataUiState>(metadataUiStateKeys);
const supportedFieldKinds = new Set<MetadataFieldKind>(metadataFieldKinds);
const supportedActionKinds = new Set(metadataActionKinds);
const supportedSectionKinds = new Set<MetadataSectionKind>(
  metadataSectionKinds
);
const supportedActionPlacements = new Set<MetadataActionPlacement>([
  "overflow",
  "primary",
  "row",
  "secondary",
]);
const supportedActionSurfaces = new Set<MetadataActionSurface>([
  "button",
  "destructive",
  "menu",
]);
const supportedValidationRuleTypes = new Set<
  MetadataFieldValidationRule["type"]
>([
  "custom",
  "email",
  "max",
  "maxlength",
  "min",
  "minlength",
  "pattern",
  "required",
]);

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0;

export type MetadataContractValidationResult = {
  diagnostic?: MetadataRendererDiagnostic;
  valid: boolean;
};

export const isKnownMetadataUiState = (
  value: string
): value is MetadataUiState =>
  supportedMetadataStates.has(value as MetadataUiState);

const manifestKindToRendererType = (
  kind: MetadataUiManifestEntry["kind"]
): MetadataRendererResolutionKind => kind;

const invalidField = (
  target: string,
  message: string
): MetadataContractValidationResult => ({
  diagnostic: createInvalidContractDiagnostic("field", target, message),
  valid: false,
});

const invalidAction = (
  target: string,
  message: string
): MetadataContractValidationResult => ({
  diagnostic: createInvalidContractDiagnostic("action", target, message),
  valid: false,
});

const invalidSection = (
  target: string,
  message: string
): MetadataContractValidationResult => ({
  diagnostic: createInvalidContractDiagnostic("section", target, message),
  valid: false,
});

const validateFieldOption = (
  option: MetadataFieldOption | null | undefined,
  fieldKey: string,
  index: number
): MetadataContractValidationResult => {
  if (!option || typeof option !== "object") {
    return invalidField(
      fieldKey,
      `Select field '${fieldKey}' option at index ${index} must be an object.`
    );
  }

  if (!isNonEmptyString(option.label)) {
    return invalidField(
      fieldKey,
      `Select field '${fieldKey}' option at index ${index} requires a non-empty label.`
    );
  }

  if (!isNonEmptyString(option.value)) {
    return invalidField(
      fieldKey,
      `Select field '${fieldKey}' option at index ${index} requires a non-empty value.`
    );
  }

  return { valid: true };
};

const validateFieldValidationRule = (
  rule: MetadataFieldValidationRule | null | undefined,
  fieldKey: string,
  index: number
): MetadataContractValidationResult => {
  if (!rule || typeof rule !== "object") {
    return invalidField(
      fieldKey,
      `Field '${fieldKey}' validation rule at index ${index} must be an object.`
    );
  }

  if (!supportedValidationRuleTypes.has(rule.type)) {
    return invalidField(
      fieldKey,
      `Field '${fieldKey}' validation rule at index ${index} has an unsupported type '${String(rule.type)}'.`
    );
  }

  return { valid: true };
};

const validateFieldShape = (
  field: MetadataFieldContract
): MetadataContractValidationResult => {
  if (field.kind !== undefined && !supportedFieldKinds.has(field.kind)) {
    return invalidField(
      field.key,
      `Field '${field.key}' has unsupported kind '${String(field.kind)}'.`
    );
  }

  if (field.kind === "select") {
    if (!Array.isArray(field.options) || field.options.length === 0) {
      return invalidField(
        field.key,
        `Select field '${field.key}' requires at least one option.`
      );
    }

    for (const [index, option] of field.options.entries()) {
      const optionValidation = validateFieldOption(option, field.key, index);

      if (!optionValidation.valid) {
        return optionValidation;
      }
    }
  }

  if (field.validation) {
    if (!Array.isArray(field.validation)) {
      return invalidField(
        field.key,
        `Field '${field.key}' validation must be an array when provided.`
      );
    }

    for (const [index, rule] of field.validation.entries()) {
      const ruleValidation = validateFieldValidationRule(
        rule,
        field.key,
        index
      );

      if (!ruleValidation.valid) {
        return ruleValidation;
      }
    }
  }

  return { valid: true };
};

export function validateMetadataFieldContract(
  field: MetadataFieldContract | null | undefined
): MetadataContractValidationResult {
  if (!field || typeof field !== "object") {
    return invalidField("unknown", "Field contract must be a non-null object.");
  }

  if (!isNonEmptyString(field.key)) {
    return invalidField(
      String(field.key ?? "unknown"),
      "Field contract requires a non-empty key."
    );
  }

  if (!isNonEmptyString(field.label)) {
    return invalidField(
      field.key,
      "Field contract requires a non-empty label."
    );
  }

  return validateFieldShape(field);
}

export function validateMetadataActionContract(
  action: MetadataActionContract | null | undefined
): MetadataContractValidationResult {
  if (!action || typeof action !== "object") {
    return invalidAction(
      "unknown",
      "Action contract must be a non-null object."
    );
  }

  if (!isNonEmptyString(action.key)) {
    return invalidAction(
      String(action.key ?? "unknown"),
      "Action contract requires a non-empty key."
    );
  }

  if (!isNonEmptyString(action.label)) {
    return invalidAction(
      action.key,
      "Action contract requires a non-empty label."
    );
  }

  if (!isNonEmptyString(action.kind)) {
    return invalidAction(
      action.key,
      `Action '${action.key}' requires a non-empty kind.`
    );
  }

  if (!supportedActionKinds.has(action.kind)) {
    return invalidAction(
      action.key,
      `Action '${action.key}' has unsupported kind '${String(action.kind)}'.`
    );
  }

  if (
    action.placement !== undefined &&
    !supportedActionPlacements.has(action.placement)
  ) {
    return invalidAction(
      action.key,
      `Action '${action.key}' has unsupported placement '${String(action.placement)}'.`
    );
  }

  if (
    action.surface !== undefined &&
    !supportedActionSurfaces.has(action.surface)
  ) {
    return invalidAction(
      action.key,
      `Action '${action.key}' has unsupported surface '${String(action.surface)}'.`
    );
  }

  if (action.confirmationPolicy !== undefined) {
    if (
      typeof action.confirmationPolicy !== "object" ||
      action.confirmationPolicy === null
    ) {
      return invalidAction(
        action.key,
        `Action '${action.key}' confirmationPolicy must be an object.`
      );
    }

    if (!isNonEmptyString(action.confirmationPolicy.message)) {
      return invalidAction(
        action.key,
        `Action '${action.key}' confirmationPolicy requires a non-empty message.`
      );
    }
  }

  return { valid: true };
}

const validateSectionFields = (
  section: MetadataSectionContract
): MetadataContractValidationResult => {
  if (!section.fields) {
    return { valid: true };
  }

  if (!Array.isArray(section.fields)) {
    return invalidSection(
      section.key,
      `Section '${section.key}' fields must be an array when provided.`
    );
  }

  for (const field of section.fields) {
    const fieldValidation = validateMetadataFieldContract(field);

    if (!fieldValidation.valid) {
      return fieldValidation;
    }
  }

  return { valid: true };
};

const validateSectionActions = (
  section: MetadataSectionContract
): MetadataContractValidationResult => {
  if (!section.actions) {
    return { valid: true };
  }

  if (!Array.isArray(section.actions)) {
    return invalidSection(
      section.key,
      `Section '${section.key}' actions must be an array when provided.`
    );
  }

  for (const action of section.actions) {
    const actionValidation = validateMetadataActionContract(action);

    if (!actionValidation.valid) {
      return actionValidation;
    }
  }

  return { valid: true };
};

const validateSectionRows = (
  section: MetadataSectionContract
): MetadataContractValidationResult => {
  if (!section.rows) {
    return { valid: true };
  }

  if (!Array.isArray(section.rows)) {
    return invalidSection(
      section.key,
      `Section '${section.key}' rows must be an array when provided.`
    );
  }

  for (const [index, row] of section.rows.entries()) {
    if (!row || typeof row !== "object" || !isNonEmptyString(row.id)) {
      return invalidSection(
        section.key,
        `Section '${section.key}' row at index ${index} requires a non-empty id.`
      );
    }
  }

  return { valid: true };
};

const validateSectionCollections = (
  section: MetadataSectionContract
): MetadataContractValidationResult => {
  const fieldValidation = validateSectionFields(section);

  if (!fieldValidation.valid) {
    return fieldValidation;
  }

  const actionValidation = validateSectionActions(section);

  if (!actionValidation.valid) {
    return actionValidation;
  }

  return validateSectionRows(section);
};

export function validateMetadataSectionContract(
  section: MetadataSectionContract | null | undefined
): MetadataContractValidationResult {
  if (!section || typeof section !== "object") {
    return invalidSection(
      "unknown",
      "Section contract must be a non-null object."
    );
  }

  if (!isNonEmptyString(section.key)) {
    return invalidSection(
      String(section.key ?? "unknown"),
      "Section contract requires a non-empty key."
    );
  }

  if (!isNonEmptyString(section.title)) {
    return invalidSection(
      section.key,
      "Section contract requires a non-empty title."
    );
  }

  if (section.kind !== undefined && !supportedSectionKinds.has(section.kind)) {
    return invalidSection(
      section.key,
      `Section '${section.key}' has unsupported kind '${String(section.kind)}'.`
    );
  }

  return validateSectionCollections(section);
}

export function collectManifestDuplicateRendererDiagnostics(
  entries: readonly MetadataUiManifestEntry[]
): readonly MetadataRendererDiagnostic[] {
  const seen = new Set<string>();
  const diagnostics: MetadataRendererDiagnostic[] = [];

  for (const entry of entries) {
    const duplicateKey = `${entry.kind}:${entry.registryKey}`;

    if (seen.has(duplicateKey)) {
      diagnostics.push(
        createDuplicateRendererDiagnostic(
          manifestKindToRendererType(entry.kind),
          entry.registryKey
        )
      );
      continue;
    }

    seen.add(duplicateKey);
  }

  return diagnostics;
}
