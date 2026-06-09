import type { MetadataFieldKind } from "../contracts/field-renderer.contract";
import { CheckboxFieldRenderer } from "../renderers/fields/checkbox-field.renderer";
import { DateFieldRenderer } from "../renderers/fields/date-field.renderer";
import { MoneyFieldRenderer } from "../renderers/fields/money-field.renderer";
import { NumberFieldRenderer } from "../renderers/fields/number-field.renderer";
import { SelectFieldRenderer } from "../renderers/fields/select-field.renderer";
import { SwitchFieldRenderer } from "../renderers/fields/switch-field.renderer";
import { TextFieldRenderer } from "../renderers/fields/text-field.renderer";
import { TextareaFieldRenderer } from "../renderers/fields/textarea-field.renderer";
import { createRendererRegistry } from "./create-renderer-registry";

export const defaultFieldRegistry = createRendererRegistry<
  MetadataFieldKind,
  typeof TextFieldRenderer
>([
  ["checkbox", CheckboxFieldRenderer],
  ["date", DateFieldRenderer],
  ["email", TextFieldRenderer],
  ["money", MoneyFieldRenderer],
  ["number", NumberFieldRenderer],
  ["select", SelectFieldRenderer],
  ["status", TextFieldRenderer],
  ["switch", SwitchFieldRenderer],
  ["textarea", TextareaFieldRenderer],
  ["text", TextFieldRenderer],
]);
