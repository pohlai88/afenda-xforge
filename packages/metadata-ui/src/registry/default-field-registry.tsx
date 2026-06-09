import type {
  MetadataFieldKind,
  MetadataFieldRenderer,
} from "../contracts/field-renderer.contract";
import { CheckboxFieldRenderer } from "../renderers/fields/checkbox-field.renderer";
import { DateFieldRenderer } from "../renderers/fields/date-field.renderer";
import { MoneyFieldRenderer } from "../renderers/fields/money-field.renderer";
import { NumberFieldRenderer } from "../renderers/fields/number-field.renderer";
import { SelectFieldRenderer } from "../renderers/fields/select-field.renderer";
import { SwitchFieldRenderer } from "../renderers/fields/switch-field.renderer";
import { TextFieldRenderer } from "../renderers/fields/text-field.renderer";
import { TextareaFieldRenderer } from "../renderers/fields/textarea-field.renderer";
import { createRendererRegistry } from "./create-renderer-registry.ts";

export const defaultFieldRegistry = createRendererRegistry<
  MetadataFieldKind,
  MetadataFieldRenderer
>([
  { key: "checkbox", renderer: CheckboxFieldRenderer, version: "1.0.0" },
  { key: "date", renderer: DateFieldRenderer, version: "1.0.0" },
  { key: "email", renderer: TextFieldRenderer, version: "1.0.0" },
  { key: "money", renderer: MoneyFieldRenderer, version: "1.0.0" },
  { key: "number", renderer: NumberFieldRenderer, version: "1.0.0" },
  { key: "select", renderer: SelectFieldRenderer, version: "1.0.0" },
  { key: "status", renderer: TextFieldRenderer, version: "1.0.0" },
  { key: "switch", renderer: SwitchFieldRenderer, version: "1.0.0" },
  { key: "textarea", renderer: TextareaFieldRenderer, version: "1.0.0" },
  { key: "text", renderer: TextFieldRenderer, version: "1.0.0" },
]);
