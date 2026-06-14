import type { AfendaRuntimeRule } from "../runtime-reference.contract";
import {
  AFENDA_GOV_FORM_ADAPTER,
  AFENDA_GOV_FORM_FIELD,
  AFENDA_GOV_FORMS,
  AFENDA_GOV_FORM_STATE,
  AFENDA_GOV_FORM_VALIDATION,
  XFORGE_GOV_MUTATION_PIPELINE,
} from "../catalogs/governance-reference.catalog";

const FORMS = "forms" as const;
const ERROR = "error" as const;
const WARNING = "warning" as const;
const STATIC = "static" as const;
const MANUAL = "manual" as const;
const HYBRID = "hybrid" as const;

export const AFENDA_FORMS_RULES = [
  {
    id: "forms.framework-contract",
    category: FORMS,
    severity: ERROR,
    appliesTo: ["form", "field", "form-framework", "server-action"],
    rationale:
      "Enterprise forms must be portable across form engines while preserving accessibility, validation, pending state, and server authority.",
    requirement:
      "Every form implementation must use an approved form adapter that binds label, description, error, invalid state, pending state, and schema validation consistently.",
    remediation:
      "Use the Afenda form adapter instead of wiring raw inputs directly in feature code.",
    references: [
      AFENDA_GOV_FORM_ADAPTER,
      AFENDA_GOV_FORM_FIELD,
      AFENDA_GOV_FORM_STATE,
      AFENDA_GOV_FORM_VALIDATION,
      "WCAG:1.3.1",
      "WCAG:3.3.1",
      "WCAG:3.3.2",
      "WCAG:4.1.3",
    ],
    enforcement: HYBRID,
  },
  {
    id: "forms.input-contract",
    category: FORMS,
    severity: ERROR,
    appliesTo: ["input", "select", "textarea"],
    rationale:
      "Named and typed controls improve browser assistance, autofill, and validation.",
    requirement: "Inputs need meaningful name, autocomplete, and correct type/inputmode.",
    remediation: "Declare name, autocomplete, and the narrowest valid type/inputmode.",
    references: [AFENDA_GOV_FORMS, "WCAG:1.3.5", "HTML-AAM"],
    enforcement: STATIC,
  },
  {
    id: "forms.paste-allowed",
    category: FORMS,
    severity: ERROR,
    appliesTo: ["input", "textarea"],
    forbidden: ["onPaste preventDefault"],
    rationale:
      "Blocking paste harms password managers, assistive workflows, and user efficiency.",
    requirement: "Paste must not be blocked.",
    remediation: "Remove paste prevention and validate submitted values instead.",
    references: [AFENDA_GOV_FORMS, "WCAG:3.3.8", "WCAG:3.3.7"],
    enforcement: STATIC,
  },
  {
    id: "forms.inline-errors",
    category: FORMS,
    severity: ERROR,
    appliesTo: ["form", "field"],
    rationale:
      "Inline errors keep validation feedback attached to the field that needs correction.",
    requirement: "Validation errors must render inline next to affected fields.",
    remediation: "Show field-level errors and focus the first invalid field on submit.",
    references: [AFENDA_GOV_FORMS, "WCAG:3.3.1", "WCAG:3.3.3"],
    enforcement: MANUAL,
  },
  {
    id: "forms.submit-pending-state",
    category: FORMS,
    severity: ERROR,
    appliesTo: ["form", "submit-button", "server-action"],
    rationale:
      "Users need clear feedback that a submission is in progress and duplicate submits are guarded.",
    requirement:
      "Submitting forms must expose pending state and prevent duplicate unsafe submission.",
    remediation:
      "Disable or busy-mark the submit control, preserve entered values, and render progress text or status.",
    references: [AFENDA_GOV_FORMS, "WCAG:4.1.3", "WCAG:3.2.2"],
    enforcement: HYBRID,
  },
  {
    id: "forms.error-summary-focus",
    category: FORMS,
    severity: ERROR,
    appliesTo: ["form", "error-summary", "validation-message"],
    rationale:
      "Complex enterprise forms need a reliable recovery path when multiple fields fail validation.",
    requirement:
      "Forms with multiple validation errors must provide a summary or focus path to the first error.",
    remediation:
      "Render an error summary linked to invalid fields or move focus to the first invalid field.",
    references: [AFENDA_GOV_FORMS, "WCAG:3.3.1", "WCAG:3.3.3", "WCAG:2.4.3"],
    enforcement: MANUAL,
  },
  {
    id: "forms.help-text-association",
    category: FORMS,
    severity: ERROR,
    appliesTo: ["field", "input", "select", "textarea", "help-text"],
    rationale:
      "Helpful instructions must be programmatically associated with the control they explain.",
    requirement:
      "Field help, hints, constraints, and descriptions must be connected to controls.",
    remediation:
      "Use aria-describedby to connect help text, constraints, and descriptions to the field.",
    references: [AFENDA_GOV_FORMS, "WCAG:1.3.1", "WCAG:3.3.2"],
    enforcement: HYBRID,
  },
  {
    id: "forms.error-message-association",
    category: FORMS,
    severity: ERROR,
    appliesTo: ["field", "input", "select", "textarea", "validation-message"],
    rationale:
      "Validation messages must be programmatically connected so assistive technology users know which field failed.",
    requirement: "Field errors must be associated with their invalid control.",
    remediation:
      "Use aria-invalid and aria-describedby or equivalent framework primitives.",
    references: [AFENDA_GOV_FORMS, "WCAG:3.3.1", "WCAG:4.1.3"],
    enforcement: HYBRID,
  },
  {
    id: "forms.required-indicator",
    category: FORMS,
    severity: WARNING,
    appliesTo: ["field", "label", "form"],
    rationale:
      "Required and optional fields must be clear before submission to reduce preventable errors.",
    requirement: "Required fields must be programmatically and visually indicated.",
    remediation:
      "Use required or aria-required and provide visible required/optional language where needed.",
    references: [AFENDA_GOV_FORMS, "WCAG:3.3.2"],
    enforcement: HYBRID,
  },
  {
    id: "forms.disabled-readonly-semantics",
    category: FORMS,
    severity: WARNING,
    appliesTo: ["input", "select", "textarea", "field"],
    rationale:
      "Disabled and read-only fields communicate different workflow and submission semantics.",
    requirement:
      "Disabled, read-only, and permission-locked fields must use the correct semantic state.",
    remediation:
      "Use disabled for unavailable controls, readonly for immutable submitted values, and aria-disabled for custom controls.",
    references: [AFENDA_GOV_FORMS, "WCAG:4.1.2"],
    enforcement: MANUAL,
  },
  {
    id: "forms.destructive-submit-confirmation",
    category: FORMS,
    severity: ERROR,
    appliesTo: ["form", "submit-button", "mutation", "destructive-action"],
    rationale:
      "Irreversible or high-impact form submissions require an explicit user confirmation path.",
    requirement:
      "Destructive or irreversible submissions must require confirmation or provide a safe undo path.",
    remediation:
      "Add confirmation, review step, or undo where the mutation deletes, overwrites, or submits high-impact data.",
    references: [AFENDA_GOV_FORMS, "WCAG:3.3.4", XFORGE_GOV_MUTATION_PIPELINE],
    enforcement: MANUAL,
  },
  {
    id: "forms.server-validation-finality",
    category: FORMS,
    severity: ERROR,
    appliesTo: ["form", "server-action", "mutation"],
    rationale:
      "Client validation improves feedback but cannot be the authority for enterprise mutations.",
    requirement: "Server validation must be final for submitted form data.",
    remediation:
      "Validate on the server, return field-level errors, and keep client validation as a convenience layer.",
    references: [AFENDA_GOV_FORMS, XFORGE_GOV_MUTATION_PIPELINE],
    enforcement: MANUAL,
  },
] as const satisfies readonly AfendaRuntimeRule[];
