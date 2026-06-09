import type { ReactElement } from "react";

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

export type MetadataFieldOption = {
  disabled?: boolean;
  label: string;
  value: string;
};

export type MetadataFieldContract = {
  disabled?: boolean;
  helpText?: string;
  kind?: MetadataFieldKind;
  key: string;
  label: string;
  options?: readonly MetadataFieldOption[];
  placeholder?: string;
  readOnly?: boolean;
  required?: boolean;
};

export type MetadataFieldRendererProps = {
  context: MetadataRenderContext;
  disabled?: boolean;
  field: MetadataFieldContract;
  value?: unknown;
};

export type MetadataFieldRenderer = (
  props: MetadataFieldRendererProps
) => ReactElement | null;
