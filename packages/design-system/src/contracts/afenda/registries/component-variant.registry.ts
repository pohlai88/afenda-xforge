import { z } from "zod";

import { defineRegistry } from "../../registry.schema";
import type { AfendaControlSize } from "./component-size.registry";
import { afendaControlSizeSchema } from "./component-size.registry";
import type { AfendaStatusTone } from "./color-token.registry";
import { afendaStatusToneSchema } from "./color-token.registry";

export const AFENDA_COMPONENT_VARIANT_REGISTRY_ID =
  "afenda.component-variant-registry" as const;
export const AFENDA_COMPONENT_VARIANT_REGISTRY_VERSION = "0.1.0" as const;

export const AFENDA_BUTTON_VARIANTS = defineRegistry([
  "default",
  "secondary",
  "outline",
  "ghost",
  "link",
  "destructive",
  "success",
  "warning",
  "info",
]);

export const AFENDA_BADGE_VARIANTS = defineRegistry([
  "default",
  "secondary",
  "outline",
  "muted",
  "lane",
  "success",
  "warning",
  "destructive",
  "info",
]);

export const AFENDA_CARD_VARIANTS = defineRegistry([
  "default",
  "surface",
  "muted",
  "accent",
  "danger",
]);

export const AFENDA_CARD_PADDING = defineRegistry(["none", "sm", "md", "lg"]);

export const AFENDA_FORM_VARIANT_STATES = defineRegistry([
  "idle",
  "pending",
  "invalid",
  "success",
  "error",
  "forbidden",
]);

export const AFENDA_TABLE_STATES = defineRegistry([
  "loading",
  "empty",
  "error",
  "forbidden",
  "ready",
]);

export const AFENDA_TABLE_VARIANTS = defineRegistry([
  "default",
  "bordered",
  "surface",
  "dense",
]);

export const AFENDA_FIELD_VARIANTS = defineRegistry([
  "default",
  "invalid",
  "readonly",
  "disabled",
]);

export const AFENDA_COMPONENT_VARIANT_GOVERNANCE_REFERENCES = [
  "AFENDA:design-system-contract",
  "AFENDA:visual-design-contract",
  "AFENDA:interaction-contract",
  "AFENDA:forms-contract",
  "AFENDA:data-display-contract",
  "AFENDA:component-size-registry",
  "AFENDA:status-tone-contract",
  "AFENDA:variant-promotion-contract",
] as const;

export type AfendaButtonVariant = (typeof AFENDA_BUTTON_VARIANTS)[number];
export type AfendaBadgeVariant = (typeof AFENDA_BADGE_VARIANTS)[number];
export type AfendaCardVariant = (typeof AFENDA_CARD_VARIANTS)[number];
export type AfendaCardPadding = (typeof AFENDA_CARD_PADDING)[number];
export type AfendaCardPaddingOption = AfendaCardPadding;
export type AfendaFormVariantState = (typeof AFENDA_FORM_VARIANT_STATES)[number];
export type AfendaTableState = (typeof AFENDA_TABLE_STATES)[number];
export type AfendaTableVariant = (typeof AFENDA_TABLE_VARIANTS)[number];
export type AfendaFieldVariant = (typeof AFENDA_FIELD_VARIANTS)[number];

export type AfendaButtonVariantContract = {
  size: AfendaControlSize;
  variant: AfendaButtonVariant;
};

export type AfendaBadgeVariantContract = {
  tone?: AfendaStatusTone;
  variant: AfendaBadgeVariant;
};

export type AfendaCardVariantContract = {
  variant: AfendaCardVariant;
};

export const afendaButtonVariantSchema = z.enum(AFENDA_BUTTON_VARIANTS);
export const afendaBadgeVariantSchema = z.enum(AFENDA_BADGE_VARIANTS);
export const afendaCardVariantSchema = z.enum(AFENDA_CARD_VARIANTS);
export const afendaCardPaddingSchema = z.enum(AFENDA_CARD_PADDING);
export const afendaFormVariantStateSchema = z.enum(AFENDA_FORM_VARIANT_STATES);
export const afendaTableStateSchema = z.enum(AFENDA_TABLE_STATES);
export const afendaTableVariantSchema = z.enum(AFENDA_TABLE_VARIANTS);
export const afendaFieldVariantSchema = z.enum(AFENDA_FIELD_VARIANTS);

export const afendaButtonVariantContractSchema = z
  .object({
    size: afendaControlSizeSchema,
    variant: afendaButtonVariantSchema,
  })
  .strict();

export const afendaBadgeVariantContractSchema = z
  .object({
    tone: afendaStatusToneSchema.optional(),
    variant: afendaBadgeVariantSchema,
  })
  .strict();

export const afendaCardVariantContractSchema = z
  .object({
    variant: afendaCardVariantSchema,
  })
  .strict();

export const afendaComponentVariantRegistrySchema = z
  .object({
    badgeVariants: z.array(afendaBadgeVariantSchema).min(1).readonly(),
    buttonVariants: z.array(afendaButtonVariantSchema).min(1).readonly(),
    cardPadding: z.array(afendaCardPaddingSchema).min(1).readonly(),
    cardVariants: z.array(afendaCardVariantSchema).min(1).readonly(),
    fieldVariants: z.array(afendaFieldVariantSchema).min(1).readonly(),
    formStates: z.array(afendaFormVariantStateSchema).min(1).readonly(),
    governanceReferences: z.array(z.string().trim().min(1)).min(1).readonly(),
    id: z.literal(AFENDA_COMPONENT_VARIANT_REGISTRY_ID),
    tableStates: z.array(afendaTableStateSchema).min(1).readonly(),
    tableVariants: z.array(afendaTableVariantSchema).min(1).readonly(),
    version: z.literal(AFENDA_COMPONENT_VARIANT_REGISTRY_VERSION),
  })
  .strict()
  .refine(
    (registry) =>
      registry.buttonVariants.includes("destructive") &&
      registry.badgeVariants.includes("lane") &&
      registry.fieldVariants.includes("invalid") &&
      registry.formStates.includes("forbidden") &&
      registry.tableStates.includes("forbidden"),
    "Afenda component variant registry must preserve destructive, lane, invalid, and forbidden governance states"
  );

export const afendaComponentVariantRegistry = {
  id: AFENDA_COMPONENT_VARIANT_REGISTRY_ID,
  version: AFENDA_COMPONENT_VARIANT_REGISTRY_VERSION,
  buttonVariants: AFENDA_BUTTON_VARIANTS,
  badgeVariants: AFENDA_BADGE_VARIANTS,
  cardVariants: AFENDA_CARD_VARIANTS,
  cardPadding: AFENDA_CARD_PADDING,
  formStates: AFENDA_FORM_VARIANT_STATES,
  tableStates: AFENDA_TABLE_STATES,
  tableVariants: AFENDA_TABLE_VARIANTS,
  fieldVariants: AFENDA_FIELD_VARIANTS,
  governanceReferences: AFENDA_COMPONENT_VARIANT_GOVERNANCE_REFERENCES,
} as const;

export function validateAfendaComponentVariantRegistry(): void {
  afendaComponentVariantRegistrySchema.parse(afendaComponentVariantRegistry);
}
