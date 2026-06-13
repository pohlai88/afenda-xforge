export const AFENDA_FORM_FRAMEWORK_CONTRACT_ID =
  "afenda.form-framework" as const;

export const AFENDA_FORM_ENGINE_MODES = [
  "react-hook-form",
  "tanstack-form",
  "formisch",
  "next-server-action",
] as const;

export type AfendaFormEngineMode = (typeof AFENDA_FORM_ENGINE_MODES)[number];

export const AFENDA_FORM_FRAMEWORK_REQUIREMENTS = [
  "schema-source-of-truth",
  "typed-field-path",
  "label-description-error-binding",
  "aria-invalid-binding",
  "pending-state-binding",
  "server-validation-finality",
  "preserve-values-on-error",
  "reset-only-on-success",
  "array-field-stable-keys",
  "paste-allowed",
] as const;

export type AfendaFormFrameworkRequirement =
  (typeof AFENDA_FORM_FRAMEWORK_REQUIREMENTS)[number];

export type AfendaFormFrameworkContract = {
  approvedEngines: readonly AfendaFormEngineMode[];
  id: typeof AFENDA_FORM_FRAMEWORK_CONTRACT_ID;
  requirements: readonly AfendaFormFrameworkRequirement[];
};

export const afendaFormFrameworkContract = {
  id: AFENDA_FORM_FRAMEWORK_CONTRACT_ID,
  approvedEngines: AFENDA_FORM_ENGINE_MODES,
  requirements: AFENDA_FORM_FRAMEWORK_REQUIREMENTS,
} as const satisfies AfendaFormFrameworkContract;

export const AFENDA_FORM_FIELD_CONTRACT_ID = "afenda.form-field" as const;

export const AFENDA_FORM_FIELD_BINDINGS = [
  "field-id",
  "field-name",
  "typed-path",
  "label-id",
  "description-id",
  "error-id",
  "aria-describedby",
  "aria-invalid",
  "data-invalid",
] as const;

export type AfendaFormFieldBinding = (typeof AFENDA_FORM_FIELD_BINDINGS)[number];

export type AfendaFormFieldContract = {
  bindings: readonly AfendaFormFieldBinding[];
  id: typeof AFENDA_FORM_FIELD_CONTRACT_ID;
};

export const afendaFormFieldContract = {
  id: AFENDA_FORM_FIELD_CONTRACT_ID,
  bindings: AFENDA_FORM_FIELD_BINDINGS,
} as const satisfies AfendaFormFieldContract;

export const AFENDA_FORM_STATE_CONTRACT_ID = "afenda.form-state" as const;

export const AFENDA_FORM_STATES = [
  "idle",
  "dirty",
  "touched",
  "validating",
  "invalid",
  "pending",
  "success",
  "error",
  "disabled",
  "readonly",
] as const;

export type AfendaFormState = (typeof AFENDA_FORM_STATES)[number];

export type AfendaFormStateContract = {
  id: typeof AFENDA_FORM_STATE_CONTRACT_ID;
  states: readonly AfendaFormState[];
};

export const afendaFormStateContract = {
  id: AFENDA_FORM_STATE_CONTRACT_ID,
  states: AFENDA_FORM_STATES,
} as const satisfies AfendaFormStateContract;

export const AFENDA_FORM_VALIDATION_CONTRACT_ID =
  "afenda.form-validation" as const;

export const AFENDA_FORM_VALIDATION_REQUIREMENTS = [
  "schema-validates-client-shape",
  "schema-validates-server-shape",
  "field-errors-returned-by-path",
  "form-errors-supported",
  "submitted-values-preserved-on-error",
  "successful-submit-may-reset",
  "server-validation-is-final",
] as const;

export type AfendaFormValidationRequirement =
  (typeof AFENDA_FORM_VALIDATION_REQUIREMENTS)[number];

export type AfendaFormValidationContract = {
  id: typeof AFENDA_FORM_VALIDATION_CONTRACT_ID;
  requirements: readonly AfendaFormValidationRequirement[];
};

export const afendaFormValidationContract = {
  id: AFENDA_FORM_VALIDATION_CONTRACT_ID,
  requirements: AFENDA_FORM_VALIDATION_REQUIREMENTS,
} as const satisfies AfendaFormValidationContract;
