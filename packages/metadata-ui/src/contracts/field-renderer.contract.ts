import type { ReactElement } from "react";

import type { MetadataDiagnostic } from "./diagnostics.contract";
import type { MetadataGovernancePolicy } from "./governance.contract";
import type { MetadataRenderContext } from "./render-context.contract";

export type MetadataFieldKind =
  | "checkbox"
  | "date"
  | "email"
  | "money"
  | "number"
  | "select"
  | "status"
  | "switch"
  | "textarea"
  | "text";

export const metadataFieldKinds = [
  "checkbox",
  "date",
  "email",
  "money",
  "number",
  "select",
  "status",
  "switch",
  "textarea",
  "text",
] as const satisfies readonly MetadataFieldKind[];

export type MetadataFieldOption = {
  disabled?: boolean;
  label: string;
  value: string;
};

export type MetadataFieldValidationRule = {
  message?: string;
  type:
    | "custom"
    | "email"
    | "max"
    | "maxlength"
    | "min"
    | "minlength"
    | "pattern"
    | "required";
  value?: string | number | boolean;
};

export type MetadataFieldContract = MetadataGovernancePolicy & {
  description?: string;
  disabled?: boolean;
  helpText?: string;
  id?: string;
  kind?: MetadataFieldKind;
  key: string;
  label: string;
  labelKey?: string;
  labels?: Readonly<Partial<Record<string, string>>>;
  metadata?: Record<string, unknown>;
  options?: readonly MetadataFieldOption[];
  placeholder?: string;
  readOnly?: boolean;
  required?: boolean;
  validation?: readonly MetadataFieldValidationRule[];
  visible?: boolean;
};

export type MetadataFieldRendererProps = {
  context: MetadataRenderContext;
  disabled?: boolean;
  diagnostics?: readonly MetadataDiagnostic[];
  field: MetadataFieldContract;
  onChange?: (value: unknown) => void;
  value?: unknown;
};

export type MetadataFieldRenderer = (
  props: MetadataFieldRendererProps
) => ReactElement | null;
